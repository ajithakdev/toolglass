import { describe, it, expect } from 'vitest';
import {
  extractWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toConstantCase,
  toKebabCase,
  toTitleCase,
  toSentenceCase,
  toDotCase,
  toPathCase,
  toSlug,
  detectCasing,
  convertAllCases,
} from './caseConverter';

describe('caseConverter logic', () => {
  it('extracts words from diverse input casing conventions', () => {
    expect(extractWords('helloWorld')).toEqual(['hello', 'World']);
    expect(extractWords('HelloWorldTest')).toEqual(['Hello', 'World', 'Test']);
    expect(extractWords('hello_world_test')).toEqual(['hello', 'world', 'test']);
    expect(extractWords('HELLO_WORLD_TEST')).toEqual(['HELLO', 'WORLD', 'TEST']);
    expect(extractWords('hello-world-test')).toEqual(['hello', 'world', 'test']);
    expect(extractWords('hello.world.test')).toEqual(['hello', 'world', 'test']);
    expect(extractWords('hello/world/test')).toEqual(['hello', 'world', 'test']);
    expect(extractWords('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request']);
  });

  it('handles empty and whitespace input', () => {
    expect(extractWords('')).toEqual([]);
    expect(extractWords('   ')).toEqual([]);
    expect(toCamelCase([])).toBe('');
    expect(toSentenceCase([])).toBe('');
    expect(toSlug('')).toBe('');
  });

  it('converts to camelCase', () => {
    expect(toCamelCase(['hello', 'world'])).toBe('helloWorld');
    expect(toCamelCase(['user', 'profile', 'data'])).toBe('userProfileData');
  });

  it('converts to PascalCase', () => {
    expect(toPascalCase(['hello', 'world'])).toBe('HelloWorld');
  });

  it('converts to snake_case and CONSTANT_CASE', () => {
    expect(toSnakeCase(['Hello', 'World'])).toBe('hello_world');
    expect(toConstantCase(['Hello', 'World'])).toBe('HELLO_WORLD');
  });

  it('converts to kebab-case, dot.case, and path/case', () => {
    expect(toKebabCase(['hello', 'world'])).toBe('hello-world');
    expect(toDotCase(['hello', 'world'])).toBe('hello.world');
    expect(toPathCase(['hello', 'world'])).toBe('hello/world');
  });

  it('converts to Title Case and Sentence case', () => {
    expect(toTitleCase(['hello', 'world', 'again'])).toBe('Hello World Again');
    expect(toSentenceCase(['hello', 'world', 'again'])).toBe('Hello world again');
  });

  it('generates clean URL slugs stripping unicode diacritics', () => {
    expect(toSlug('Café & Restaurant — 2026!')).toBe('cafe-restaurant-2026');
    expect(toSlug('Crème Brûlée at Noël')).toBe('creme-brulee-at-noel');
    expect(toSlug('Niño Español')).toBe('nino-espanol');
    expect(toSlug('---Hello   World---')).toBe('hello-world');
  });

  it('detects common casing formats accurately', () => {
    expect(detectCasing('camelCase')).toBe('camelCase');
    expect(detectCasing('PascalCase')).toBe('PascalCase');
    expect(detectCasing('snake_case')).toBe('snake_case');
    expect(detectCasing('CONSTANT_CASE')).toBe('CONSTANT_CASE');
    expect(detectCasing('kebab-case')).toBe('kebab-case');
    expect(detectCasing('dot.case')).toBe('dot.case');
    expect(detectCasing('path/case')).toBe('path/case');
    expect(detectCasing('lowercase')).toBe('lowercase');
    expect(detectCasing('UPPERCASE')).toBe('UPPERCASE');
    expect(detectCasing('Camel')).toBe('Capitalized');
    expect(detectCasing('Café')).toBe('Capitalized');
    expect(detectCasing('café')).toBe('lowercase');
    expect(detectCasing('CAFÉ')).toBe('UPPERCASE');
    expect(detectCasing('Plain english text here')).toBe('Natural text');
    expect(detectCasing('')).toBe('Unknown');
  });

  it('convertAllCases returns all 12 formats', () => {
    const results = convertAllCases('user_account_setting');
    expect(results).toHaveLength(12);

    const map = Object.fromEntries(results.map((r) => [r.id, r.value]));
    expect(map.camel).toBe('userAccountSetting');
    expect(map.pascal).toBe('UserAccountSetting');
    expect(map.snake).toBe('user_account_setting');
    expect(map.constant).toBe('USER_ACCOUNT_SETTING');
    expect(map.kebab).toBe('user-account-setting');
    expect(map.slug).toBe('user-account-setting');
    expect(map.title).toBe('User Account Setting');
    expect(map.sentence).toBe('User account setting');
    expect(map.dot).toBe('user.account.setting');
    expect(map.path).toBe('user/account/setting');
  });

  it('preserves accented and international letters across case conversions', () => {
    const cafeWords = extractWords('caféLatte');
    expect(cafeWords).toEqual(['café', 'Latte']);
    expect(toSnakeCase(cafeWords)).toBe('café_latte');
    expect(toPascalCase(cafeWords)).toBe('CaféLatte');
    expect(toConstantCase(cafeWords)).toBe('CAFÉ_LATTE');
    expect(toKebabCase(cafeWords)).toBe('café-latte');
    expect(toTitleCase(cafeWords)).toBe('Café Latte');
    expect(toSentenceCase(cafeWords)).toBe('Café latte');
    expect(toDotCase(cafeWords)).toBe('café.latte');
    expect(toPathCase(cafeWords)).toBe('café/latte');

    const multiAccented = extractWords('Café & Restaurant');
    expect(multiAccented).toEqual(['Café', 'Restaurant']);
    expect(toCamelCase(multiAccented)).toBe('caféRestaurant');
    expect(toSnakeCase(multiAccented)).toBe('café_restaurant');
  });

  it('handles words written entirely in non-Latin scripts', () => {
    // Cyrillic
    const cyrillicWords = extractWords('приветМир');
    expect(cyrillicWords).toEqual(['привет', 'Мир']);
    expect(toSnakeCase(cyrillicWords)).toBe('привет_мир');
    expect(toCamelCase(extractWords('привет_мир'))).toBe('приветМир');
    expect(toPascalCase(cyrillicWords)).toBe('ПриветМир');
    expect(toConstantCase(cyrillicWords)).toBe('ПРИВЕТ_МИР');
    expect(toKebabCase(cyrillicWords)).toBe('привет-мир');
    expect(toSlug('Привет Мир')).toBe('привет-мир');

    // Greek
    const greekWords = extractWords('γειαΣου');
    expect(greekWords).toEqual(['γεια', 'Σου']);
    expect(toSnakeCase(greekWords)).toBe('γεια_σου');
    expect(toPascalCase(greekWords)).toBe('ΓειαΣου');
  });

  it('detects casing correctly for international text', () => {
    expect(detectCasing('caféLatte')).toBe('camelCase');
    expect(detectCasing('CaféLatte')).toBe('PascalCase');
    expect(detectCasing('café_latte')).toBe('snake_case');
    expect(detectCasing('CAFÉ_LATTE')).toBe('CONSTANT_CASE');
    expect(detectCasing('приветМир')).toBe('camelCase');
    expect(detectCasing('привет_мир')).toBe('snake_case');
  });
});
