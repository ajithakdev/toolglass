import { describe, it, expect } from 'vitest';
import {
  toOctal,
  toSymbolic,
  toSymbolicCommand,
  parseOctal,
  DEFAULT_CHMOD_STATE,
  PRESETS,
  calculateOctalPart,
  calculateSpecialPart,
  escapeShellArg,
  type ChmodState,
} from './chmod';

describe('chmod calculation logic', () => {
  it('calculates octal and symbolic for default 755', () => {
    expect(toOctal(DEFAULT_CHMOD_STATE)).toBe('755');
    expect(toSymbolic(DEFAULT_CHMOD_STATE)).toBe('rwxr-xr-x');
    expect(toSymbolicCommand(DEFAULT_CHMOD_STATE)).toBe('u=rwx,g=rx,o=rx');
  });

  it('calculates permissions for 644 (standard file)', () => {
    const state: ChmodState = {
      special: { suid: false, sgid: false, sticky: false },
      user: { read: true, write: true, execute: false },
      group: { read: true, write: false, execute: false },
      other: { read: true, write: false, execute: false },
    };
    expect(toOctal(state)).toBe('644');
    expect(toSymbolic(state)).toBe('rw-r--r--');
    expect(toSymbolicCommand(state)).toBe('u=rw,g=r,o=r');
  });

  it('calculates permissions for 600 (SSH key)', () => {
    const state: ChmodState = {
      special: { suid: false, sgid: false, sticky: false },
      user: { read: true, write: true, execute: false },
      group: { read: false, write: false, execute: false },
      other: { read: false, write: false, execute: false },
    };
    expect(toOctal(state)).toBe('600');
    expect(toSymbolic(state)).toBe('rw-------');
    expect(toSymbolicCommand(state)).toBe('u=rw,g=,o=');
  });

  it('calculates permissions with special bits: SUID (4755)', () => {
    const state: ChmodState = {
      special: { suid: true, sgid: false, sticky: false },
      user: { read: true, write: true, execute: true },
      group: { read: true, write: false, execute: true },
      other: { read: true, write: false, execute: true },
    };
    expect(toOctal(state)).toBe('4755');
    expect(toSymbolic(state)).toBe('rwsr-xr-x');
    expect(toSymbolicCommand(state)).toBe('u=rwxs,g=rx,o=rx');
  });

  it('calculates permissions with special bits: SUID without execute (capital S)', () => {
    const state: ChmodState = {
      special: { suid: true, sgid: false, sticky: false },
      user: { read: true, write: true, execute: false },
      group: { read: true, write: false, execute: true },
      other: { read: true, write: false, execute: true },
    };
    expect(toOctal(state)).toBe('4655');
    expect(toSymbolic(state)).toBe('rwSr-xr-x');
  });

  it('calculates permissions with Sticky Bit (1777)', () => {
    const state: ChmodState = {
      special: { suid: false, sgid: false, sticky: true },
      user: { read: true, write: true, execute: true },
      group: { read: true, write: true, execute: true },
      other: { read: true, write: true, execute: true },
    };
    expect(toOctal(state)).toBe('1777');
    expect(toSymbolic(state)).toBe('rwxrwxrwt');
    expect(toSymbolicCommand(state)).toBe('u=rwx,g=rwx,o=rwxt');
  });

  it('calculates permissions with SGID (2775)', () => {
    const state: ChmodState = {
      special: { suid: false, sgid: true, sticky: false },
      user: { read: true, write: true, execute: true },
      group: { read: true, write: true, execute: true },
      other: { read: true, write: false, execute: true },
    };
    expect(toOctal(state)).toBe('2775');
    expect(toSymbolic(state)).toBe('rwxrwsr-x');
  });

  it('parses octal strings correctly into state', () => {
    const parsed755 = parseOctal('755');
    expect(parsed755).not.toBeNull();
    expect(toOctal(parsed755!)).toBe('755');

    const parsed1777 = parseOctal('1777');
    expect(parsed1777).not.toBeNull();
    expect(toOctal(parsed1777!)).toBe('1777');
    expect(parsed1777!.special.sticky).toBe(true);

    const parsed600 = parseOctal('600');
    expect(parsed600).not.toBeNull();
    expect(toOctal(parsed600!)).toBe('600');
  });

  it('returns null for invalid octal inputs', () => {
    expect(parseOctal('')).toBeNull();
    expect(parseOctal('888')).toBeNull();
    expect(parseOctal('abc')).toBeNull();
    expect(parseOctal('12')).toBeNull();
    expect(parseOctal('12345')).toBeNull();
  });

  it('validates all presets parse and format back cleanly', () => {
    PRESETS.forEach((preset) => {
      const parsed = parseOctal(preset.octal);
      expect(parsed).not.toBeNull();
      expect(toOctal(parsed!)).toBe(preset.octal);
    });
  });

  it('handles empty permissions properly in symbolic command', () => {
    const empty: ChmodState = {
      special: { suid: false, sgid: false, sticky: false },
      user: { read: false, write: false, execute: false },
      group: { read: false, write: false, execute: false },
      other: { read: false, write: false, execute: false },
    };
    expect(toOctal(empty)).toBe('000');
    expect(toSymbolic(empty)).toBe('---------');
    expect(toSymbolicCommand(empty)).toBe('u=,g=,o=');
  });

  it('computes individual bit values accurately', () => {
    expect(calculateOctalPart({ read: true, write: true, execute: true })).toBe(7);
    expect(calculateOctalPart({ read: true, write: false, execute: true })).toBe(5);
    expect(calculateSpecialPart({ suid: true, sgid: true, sticky: true })).toBe(7);
  });

  it('escapes shell arguments to prevent command injection', () => {
    expect(escapeShellArg('script.sh')).toBe('script.sh');
    expect(escapeShellArg('my-script_v1.0.sh')).toBe('my-script_v1.0.sh');
    expect(escapeShellArg('path/to/my_file.py')).toBe('path/to/my_file.py');
    expect(escapeShellArg('')).toBe("''");
    expect(escapeShellArg('file with spaces.txt')).toBe("'file with spaces.txt'");
    expect(escapeShellArg('script.sh; rm -rf /')).toBe("'script.sh; rm -rf /'");
    expect(escapeShellArg('file$(whoami)test')).toBe("'file$(whoami)test'");
    expect(escapeShellArg("it's a file")).toBe("'it'\\''s a file'");
  });
});
