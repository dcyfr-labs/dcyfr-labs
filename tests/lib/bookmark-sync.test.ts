/**
 * Tests for Bookmark Server Sync
 *
 * Tests server-backed sync for bookmark collections with authentication.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  syncBookmarksWithServer,
  loadBookmarksFromServer,
  mergeBookmarkCollections,
  type BookmarkCollection,
} from '@/lib/activity/bookmarks';

// Mock storage adapter
const mockStorageAdapter = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  has: vi.fn(),
  clear: vi.fn(),
  keys: vi.fn(),
};

vi.mock('@/lib/storage-adapter', () => ({
  createStorageAdapter: vi.fn(() => mockStorageAdapter),
}));

describe('syncBookmarksWithServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark as local-only for unauthenticated users', async () => {
    const collection: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
        },
      ],
      lastUpdated: new Date('2026-01-01'),
      count: 1,
      syncStatus: 'pending',
    };

    const result = await syncBookmarksWithServer(collection, false);

    expect(result.syncStatus).toBe('local');
    expect(mockStorageAdapter.set).not.toHaveBeenCalled();
  });

  it('should sync bookmarks to server for authenticated users', async () => {
    mockStorageAdapter.set.mockResolvedValue(undefined);

    const collection: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
          notes: 'Test note',
          tags: ['important'],
        },
      ],
      lastUpdated: new Date('2026-01-01'),
      count: 1,
      syncStatus: 'pending',
    };

    const result = await syncBookmarksWithServer(collection, true, 'auth-token-123');

    expect(result.syncStatus).toBe('synced');
    expect(result.bookmarks[0].lastSyncedAt).toBeInstanceOf(Date);
    expect(mockStorageAdapter.set).toHaveBeenCalledWith(
      'bookmarks',
      expect.objectContaining({
        count: 1,
        bookmarks: expect.arrayContaining([
          expect.objectContaining({
            activityId: 'post-1',
            notes: 'Test note',
            tags: ['important'],
          }),
        ]),
      })
    );
  });

  it('should handle sync errors gracefully', async () => {
    mockStorageAdapter.set.mockRejectedValue(new Error('Network error'));

    const collection: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
        },
      ],
      lastUpdated: new Date('2026-01-01'),
      count: 1,
      syncStatus: 'pending',
    };

    const result = await syncBookmarksWithServer(collection, true, 'auth-token-123');

    expect(result.syncStatus).toBe('error');
    expect(result.syncError).toBe('Network error');
  });
});

describe('loadBookmarksFromServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null for unauthenticated users', async () => {
    const result = await loadBookmarksFromServer(false);
    expect(result).toBeNull();
  });

  it('should load bookmarks from server for authenticated users', async () => {
    mockStorageAdapter.get.mockResolvedValue({
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          lastSyncedAt: '2026-01-02T00:00:00.000Z',
          notes: 'Server note',
        },
      ],
      lastUpdated: '2026-01-02T00:00:00.000Z',
      count: 1,
    });

    const result = await loadBookmarksFromServer(true, 'auth-token-123');

    expect(result).not.toBeNull();
    expect(result?.syncStatus).toBe('synced');
    expect(result?.bookmarks[0].activityId).toBe('post-1');
    expect(result?.bookmarks[0].createdAt).toBeInstanceOf(Date);
    expect(result?.bookmarks[0].lastSyncedAt).toBeInstanceOf(Date);
  });

  it('should return null if no server data exists', async () => {
    mockStorageAdapter.get.mockResolvedValue(null);

    const result = await loadBookmarksFromServer(true, 'auth-token-123');

    expect(result).toBeNull();
  });

  it('should handle server errors gracefully', async () => {
    mockStorageAdapter.get.mockRejectedValue(new Error('Server error'));

    const result = await loadBookmarksFromServer(true, 'auth-token-123');

    expect(result).toBeNull();
  });
});

describe('mergeBookmarkCollections', () => {
  it('should merge local and server bookmarks without conflicts', () => {
    const local: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
        },
      ],
      lastUpdated: new Date('2026-01-01'),
      count: 1,
      syncStatus: 'local',
    };

    const server: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-2',
          createdAt: new Date('2026-01-02'),
          lastSyncedAt: new Date('2026-01-02'),
        },
      ],
      lastUpdated: new Date('2026-01-02'),
      count: 1,
      syncStatus: 'synced',
    };

    const result = mergeBookmarkCollections(local, server);

    expect(result.count).toBe(2);
    expect(result.bookmarks).toHaveLength(2);
    expect(result.syncStatus).toBe('synced');
  });

  it('should prefer server bookmark when more recent', () => {
    const local: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
          notes: 'Local note',
        },
      ],
      lastUpdated: new Date('2026-01-01'),
      count: 1,
      syncStatus: 'local',
    };

    const server: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
          lastSyncedAt: new Date('2026-01-03'),
          notes: 'Server note (newer)',
        },
      ],
      lastUpdated: new Date('2026-01-03'),
      count: 1,
      syncStatus: 'synced',
    };

    const result = mergeBookmarkCollections(local, server);

    expect(result.count).toBe(1);
    expect(result.bookmarks[0].notes).toBe('Server note (newer)');
  });

  it('should prefer local bookmark when more recent', () => {
    const local: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
          lastSyncedAt: new Date('2026-01-05'),
          notes: 'Local note (newer)',
        },
      ],
      lastUpdated: new Date('2026-01-05'),
      count: 1,
      syncStatus: 'local',
    };

    const server: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-01'),
          lastSyncedAt: new Date('2026-01-03'),
          notes: 'Server note',
        },
      ],
      lastUpdated: new Date('2026-01-03'),
      count: 1,
      syncStatus: 'synced',
    };

    const result = mergeBookmarkCollections(local, server);

    expect(result.count).toBe(1);
    expect(result.bookmarks[0].notes).toBe('Local note (newer)');
  });

  it('should handle empty collections', () => {
    const local: BookmarkCollection = {
      bookmarks: [],
      lastUpdated: new Date('2026-01-01'),
      count: 0,
      syncStatus: 'local',
    };

    const server: BookmarkCollection = {
      bookmarks: [
        {
          activityId: 'post-1',
          createdAt: new Date('2026-01-02'),
        },
      ],
      lastUpdated: new Date('2026-01-02'),
      count: 1,
      syncStatus: 'synced',
    };

    const result = mergeBookmarkCollections(local, server);

    expect(result.count).toBe(1);
    expect(result.bookmarks[0].activityId).toBe('post-1');
  });
});
