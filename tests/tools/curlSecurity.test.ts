import { describe, it, expect, beforeEach } from 'vitest';
import {
  isSensitiveHeader,
  sanitizeHeaders,
  hasAuthCredentials,
  sanitizeSavedRequest,
  sanitizeHistoryItem,
  saveSessionAuth,
  getSessionAuth,
  clearSessionAuth,
  scrubStorageAuth,
  SavedRequest,
  HistoryItem
} from '../../src/tools/curl-to-fetch/curlSecurity';

describe('curlSecurity utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('isSensitiveHeader', () => {
    it('identifies Authorization and variations as sensitive', () => {
      expect(isSensitiveHeader('Authorization')).toBe(true);
      expect(isSensitiveHeader('authorization')).toBe(true);
      expect(isSensitiveHeader('AUTHORIZATION')).toBe(true);
      expect(isSensitiveHeader('  authorization  ')).toBe(true);
    });

    it('identifies Proxy-Authorization, x-api-key, and cookies as sensitive', () => {
      expect(isSensitiveHeader('Proxy-Authorization')).toBe(true);
      expect(isSensitiveHeader('x-api-key')).toBe(true);
      expect(isSensitiveHeader('Cookie')).toBe(true);
      expect(isSensitiveHeader('Set-Cookie')).toBe(true);
    });

    it('does not flag non-sensitive headers', () => {
      expect(isSensitiveHeader('Content-Type')).toBe(false);
      expect(isSensitiveHeader('Accept')).toBe(false);
      expect(isSensitiveHeader('User-Agent')).toBe(false);
      expect(isSensitiveHeader('X-Custom-Header')).toBe(false);
      expect(isSensitiveHeader('')).toBe(false);
    });
  });

  describe('sanitizeHeaders', () => {
    it('strips all sensitive headers while preserving normal headers', () => {
      const headers = [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer secret_token_123' },
        { key: 'Accept', value: '*/*' },
        { key: 'X-API-KEY', value: 'my-api-key' },
      ];

      const sanitized = sanitizeHeaders(headers);
      expect(sanitized).toHaveLength(2);
      expect(sanitized).toEqual([
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Accept', value: '*/*' },
      ]);
    });

    it('handles empty or malformed arrays gracefully', () => {
      expect(sanitizeHeaders([])).toEqual([]);
      // @ts-expect-error test non-array safety
      expect(sanitizeHeaders(null)).toEqual([]);
    });
  });

  describe('hasAuthCredentials', () => {
    it('detects bearer token credentials', () => {
      expect(hasAuthCredentials({
        authType: 'bearer',
        bearerToken: 'secret123'
      })).toBe(true);

      expect(hasAuthCredentials({
        authType: 'bearer',
        bearerToken: '   '
      })).toBe(false);
    });

    it('detects basic auth credentials', () => {
      expect(hasAuthCredentials({
        authType: 'basic',
        basicUser: 'admin',
        basicPass: ''
      })).toBe(true);

      expect(hasAuthCredentials({
        authType: 'basic',
        basicUser: '',
        basicPass: 'hunter2'
      })).toBe(true);

      expect(hasAuthCredentials({
        authType: 'basic',
        basicUser: '',
        basicPass: ''
      })).toBe(false);
    });

    it('detects sensitive Authorization header with value', () => {
      expect(hasAuthCredentials({
        authType: 'none',
        headers: [
          { key: 'Authorization', value: 'Bearer xyz' }
        ]
      })).toBe(true);

      expect(hasAuthCredentials({
        authType: 'none',
        headers: [
          { key: 'Authorization', value: '   ' },
          { key: 'Content-Type', value: 'application/json' }
        ]
      })).toBe(false);
    });
  });

  describe('sanitizeSavedRequest & sanitizeHistoryItem', () => {
    const mockSavedReq: SavedRequest = {
      id: 'req-1',
      name: 'Test Workflow',
      url: 'https://api.example.com/data',
      method: 'GET',
      headers: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Authorization', value: 'Bearer token-to-strip' }
      ],
      queryParams: [],
      authType: 'bearer',
      bearerToken: 'token-to-strip',
      basicUser: 'admin',
      basicPass: 'secret',
      bodyText: '{}',
    };

    it('purges sensitive tokens and headers from SavedRequest', () => {
      const sanitized = sanitizeSavedRequest(mockSavedReq);

      expect(sanitized.bearerToken).toBe('');
      expect(sanitized.basicUser).toBe('');
      expect(sanitized.basicPass).toBe('');
      expect(sanitized.headers).toEqual([{ key: 'Content-Type', value: 'application/json' }]);
      expect(sanitized.authType).toBe('bearer'); // keeps configuration type
      expect(sanitized.requiresAuth).toBe(true); // marks that re-entry is required
    });

    it('purges sensitive tokens and headers from HistoryItem', () => {
      const mockHistory: HistoryItem = {
        id: 'hist-1',
        timestamp: Date.now(),
        url: 'https://api.example.com/test',
        method: 'POST',
        headers: [
          { key: 'Authorization', value: 'Bearer 123' },
          { key: 'X-App', value: 'toolglass' }
        ],
        queryParams: [],
        authType: 'basic',
        bearerToken: '123',
        basicUser: 'test',
        basicPass: 'pass',
        bodyText: '',
      };

      const sanitized = sanitizeHistoryItem(mockHistory);
      expect(sanitized.bearerToken).toBe('');
      expect(sanitized.basicUser).toBe('');
      expect(sanitized.basicPass).toBe('');
      expect(sanitized.headers).toEqual([{ key: 'X-App', value: 'toolglass' }]);
    });
  });

  describe('sessionStorage credential caching', () => {
    it('saves, retrieves, and clears session auth', () => {
      saveSessionAuth('wf-100', { bearerToken: 'session-token-xyz' });
      expect(getSessionAuth('wf-100')).toEqual({ bearerToken: 'session-token-xyz' });
      expect(getSessionAuth('wf-non-existent')).toBeNull();

      // Clear specific
      clearSessionAuth('wf-100');
      expect(getSessionAuth('wf-100')).toBeNull();

      // Clear all
      saveSessionAuth('wf-1', { basicUser: 'a', basicPass: 'b' });
      saveSessionAuth('wf-2', { bearerToken: 'c' });
      clearSessionAuth();
      expect(getSessionAuth('wf-1')).toBeNull();
      expect(getSessionAuth('wf-2')).toBeNull();
    });
  });

  describe('scrubStorageAuth migration', () => {
    it('scrubs unencrypted legacy credentials and authorization headers from localStorage', () => {
      const dirtySaved: SavedRequest[] = [
        {
          id: '1',
          name: 'Dirty 1',
          url: 'https://api.test/1',
          method: 'GET',
          headers: [{ key: 'Authorization', value: 'Bearer leaked' }],
          queryParams: [],
          authType: 'bearer',
          bearerToken: 'leaked_token',
          basicUser: '',
          basicPass: '',
          bodyText: '',
        },
        {
          id: '2',
          name: 'Clean 2',
          url: 'https://api.test/2',
          method: 'GET',
          headers: [{ key: 'Accept', value: 'text/html' }],
          queryParams: [],
          authType: 'none',
          bearerToken: '',
          basicUser: '',
          basicPass: '',
          bodyText: '',
        }
      ];

      const dirtyHistory: HistoryItem[] = [
        {
          id: 'h1',
          timestamp: 1000,
          url: 'https://api.test/hist',
          method: 'POST',
          headers: [{ key: 'Proxy-Authorization', value: 'Basic leakedpass' }],
          queryParams: [],
          authType: 'basic',
          bearerToken: '',
          basicUser: 'admin',
          basicPass: 'leakedpass',
          bodyText: '',
        }
      ];

      localStorage.setItem('toolglass_saved_requests', JSON.stringify(dirtySaved));
      localStorage.setItem('toolglass_request_history', JSON.stringify(dirtyHistory));

      const { scrubbedSaved, scrubbedHistory } = scrubStorageAuth();

      expect(scrubbedSaved).toBe(1);
      expect(scrubbedHistory).toBe(1);

      // Verify localStorage was updated and clean
      const cleanedSaved: SavedRequest[] = JSON.parse(localStorage.getItem('toolglass_saved_requests')!);
      expect(cleanedSaved[0].bearerToken).toBe('');
      expect(cleanedSaved[0].headers).toEqual([]);
      expect(cleanedSaved[0].requiresAuth).toBe(true);
      expect(cleanedSaved[1].bearerToken).toBe('');

      const cleanedHistory: HistoryItem[] = JSON.parse(localStorage.getItem('toolglass_request_history')!);
      expect(cleanedHistory[0].basicUser).toBe('');
      expect(cleanedHistory[0].basicPass).toBe('');
      expect(cleanedHistory[0].headers).toEqual([]);
    });

    it('does not modify localStorage if items are already clean', () => {
      const cleanSaved: SavedRequest[] = [
        {
          id: '1',
          name: 'Clean',
          url: 'https://api.test/1',
          method: 'GET',
          headers: [],
          queryParams: [],
          authType: 'none',
          bearerToken: '',
          basicUser: '',
          basicPass: '',
          bodyText: '',
        }
      ];

      localStorage.setItem('toolglass_saved_requests', JSON.stringify(cleanSaved));
      const { scrubbedSaved, scrubbedHistory } = scrubStorageAuth();
      expect(scrubbedSaved).toBe(0);
      expect(scrubbedHistory).toBe(0);
    });
  });
});
