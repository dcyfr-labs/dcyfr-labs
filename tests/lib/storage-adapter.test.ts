import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from '@/lib/storage-adapter';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter('test:');
  });

  describe('get', () => {
    it('returns null when key does not exist', async () => {
      expect(await adapter.get('missing')).toBeNull();
    });

    it('returns parsed JSON value', async () => {
      localStorage.setItem('test:foo', JSON.stringify({ bar: 1 }));
      expect(await adapter.get('foo')).toEqual({ bar: 1 });
    });

    it('returns null on invalid JSON', async () => {
      localStorage.setItem('test:broken', '{bad');
      expect(await adapter.get('broken')).toBeNull();
    });
  });

  describe('set', () => {
    it('stores value as JSON', async () => {
      await adapter.set('key1', { hello: 'world' });
      expect(JSON.parse(localStorage.getItem('test:key1')!)).toEqual({ hello: 'world' });
    });

    it('stores primitive values', async () => {
      await adapter.set('num', 42);
      expect(await adapter.get('num')).toBe(42);
    });
  });

  describe('remove', () => {
    it('removes an existing key', async () => {
      await adapter.set('del', 'val');
      await adapter.remove('del');
      expect(await adapter.get('del')).toBeNull();
    });

    it('does not throw for missing key', async () => {
      await expect(adapter.remove('nonexistent')).resolves.toBeUndefined();
    });
  });

  describe('has', () => {
    it('returns true for existing key', async () => {
      await adapter.set('exists', true);
      expect(await adapter.has('exists')).toBe(true);
    });

    it('returns false for missing key', async () => {
      expect(await adapter.has('nope')).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes only prefixed keys', async () => {
      await adapter.set('a', 1);
      await adapter.set('b', 2);
      localStorage.setItem('other:key', 'keep');
      await adapter.clear();
      expect(await adapter.has('a')).toBe(false);
      expect(await adapter.has('b')).toBe(false);
      expect(localStorage.getItem('other:key')).toBe('keep');
    });
  });

  describe('keys', () => {
    it('returns keys without prefix', async () => {
      await adapter.set('x', 1);
      await adapter.set('y', 2);
      localStorage.setItem('foreign:z', '3');
      const keys = await adapter.keys();
      expect(keys).toContain('x');
      expect(keys).toContain('y');
      expect(keys).not.toContain('z');
    });

    it('returns empty array when no keys', async () => {
      expect(await adapter.keys()).toEqual([]);
    });
  });

  describe('default prefix', () => {
    it('uses dcyfr: prefix by default', async () => {
      const defaultAdapter = new LocalStorageAdapter();
      await defaultAdapter.set('test', 'val');
      expect(localStorage.getItem('dcyfr:test')).toBe('"val"');
    });
  });
});
