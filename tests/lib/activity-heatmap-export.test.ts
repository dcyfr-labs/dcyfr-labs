/**
 * Tests for Activity Heatmap Export Utilities
 *
 * Tests the functionality for exporting heatmap visualizations as images.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateDefaultFilename,
  exportHeatmapAsImage,
  type ExportHeatmapOptions,
} from '@/lib/activity/heatmap-export';

// ============================================================================
// MOCKS
// ============================================================================

// Mock html2canvas
vi.mock('html2canvas', () => {
  return {
    default: vi.fn(() => {
      // Create a mock canvas
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;

      // Mock toDataURL
      canvas.toDataURL = vi.fn((type: string, quality?: number) => {
        return `data:${type};base64,mockBase64Data`;
      });

      return Promise.resolve(canvas);
    }),
  };
});

// Mock document.createElement for download link
const mockClick = vi.fn();
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName: string) => {
  const element = originalCreateElement(tagName);
  if (tagName === 'a') {
    element.click = mockClick;
  }
  return element;
}) as typeof document.createElement;

// ============================================================================
// TESTS: generateDefaultFilename
// ============================================================================

describe('generateDefaultFilename', () => {
  beforeEach(() => {
    // Mock Date to return consistent value
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-25T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate filename with current date', () => {
    const filename = generateDefaultFilename();
    expect(filename).toBe('activity-heatmap-2025-12-25');
  });

  it('should pad month and day with zeros', () => {
    vi.setSystemTime(new Date('2025-01-05T12:00:00Z'));
    const filename = generateDefaultFilename();
    expect(filename).toBe('activity-heatmap-2025-01-05');
  });

  it('should handle different dates consistently', () => {
    vi.setSystemTime(new Date('2025-03-15T08:30:00Z'));
    const filename = generateDefaultFilename();
    expect(filename).toBe('activity-heatmap-2025-03-15');
  });
});

// ============================================================================
// TESTS: exportHeatmapAsImage
// ============================================================================

describe('exportHeatmapAsImage', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create mock element
    mockElement = document.createElement('div');
    mockElement.innerHTML = '<p>Heatmap content</p>';
    document.body.appendChild(mockElement);

    // Clear mock calls
    mockClick.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  it('should successfully export element as PNG', async () => {
    const result = await exportHeatmapAsImage({
      element: mockElement,
      filename: 'test-heatmap',
      format: 'png',
      quality: 1.0,
    });

    expect(result.success).toBe(true);
    expect(result.filename).toBe('test-heatmap.png');
    expect(result.error).toBeUndefined();
  });

  it('should use default filename if not provided', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-25T12:00:00Z'));

    const result = await exportHeatmapAsImage({
      element: mockElement,
    });

    expect(result.success).toBe(true);
    expect(result.filename).toBe('activity-heatmap-2025-12-25.png');

    vi.useRealTimers();
  });

  it('should trigger download with correct data URL', async () => {
    await exportHeatmapAsImage({
      element: mockElement,
      filename: 'test-export',
    });

    // Verify click was called (triggers download)
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should fail gracefully if element is null', async () => {
    const result = await exportHeatmapAsImage({
      element: null as unknown as HTMLElement,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Element not found or not mounted');
    expect(result.filename).toBeUndefined();
  });

  it('should fail gracefully if element is undefined', async () => {
    const result = await exportHeatmapAsImage({
      element: undefined as unknown as HTMLElement,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Element not found or not mounted');
  });

  it('should handle different quality settings', async () => {
    const result = await exportHeatmapAsImage({
      element: mockElement,
      quality: 0.8,
    });

    expect(result.success).toBe(true);
  });

  it('should handle different scale settings', async () => {
    const result = await exportHeatmapAsImage({
      element: mockElement,
      scale: 3,
    });

    expect(result.success).toBe(true);
  });

  it('should handle transparent background', async () => {
    const result = await exportHeatmapAsImage({
      element: mockElement,
      backgroundColor: null,
    });

    expect(result.success).toBe(true);
  });

  it('should handle custom background color', async () => {
    const result = await exportHeatmapAsImage({
      element: mockElement,
      backgroundColor: '#ffffff',
    });

    expect(result.success).toBe(true);
  });

  it('should reject unsupported format', async () => {
    const result = await exportHeatmapAsImage({
      element: mockElement,
      format: 'svg' as 'png', // Force unsupported format
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unsupported format');
  });

  it('should handle html2canvas errors gracefully', async () => {
    // Temporarily override the mock to throw error
    const { default: html2canvas } = await import('html2canvas');
    vi.mocked(html2canvas).mockRejectedValueOnce(new Error('Canvas rendering failed'));

    const result = await exportHeatmapAsImage({
      element: mockElement,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Canvas rendering failed');
  });

  it('should handle unknown errors gracefully', async () => {
    // Temporarily override the mock to throw non-Error
    const { default: html2canvas } = await import('html2canvas');
    vi.mocked(html2canvas).mockRejectedValueOnce('Unknown error');

    const result = await exportHeatmapAsImage({
      element: mockElement,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown error during export');
  });

  it('should call html2canvas with correct options', async () => {
    const { default: html2canvas } = await import('html2canvas');
    vi.mocked(html2canvas).mockClear();

    await exportHeatmapAsImage({
      element: mockElement,
      backgroundColor: '#ff0000',
      scale: 3,
    });

    expect(html2canvas).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        backgroundColor: '#ff0000',
        scale: 3,
        useCORS: true,
        logging: false,
        removeContainer: true,
        imageTimeout: 15000,
        foreignObjectRendering: true,
        allowTaint: true,
      })
    );
  });
});

// ============================================================================
// TESTS: Integration
// ============================================================================

describe('exportHeatmapAsImage - Integration', () => {
  it('should successfully export with all default options', async () => {
    const mockElement = document.createElement('div');
    mockElement.innerHTML = '<div class="heatmap">Content</div>';

    const result = await exportHeatmapAsImage({
      element: mockElement,
    });

    expect(result.success).toBe(true);
    expect(result.filename).toMatch(/^activity-heatmap-\d{4}-\d{2}-\d{2}\.png$/);
  });

  it('should successfully export with custom options', async () => {
    const mockElement = document.createElement('div');
    mockElement.innerHTML = '<svg><rect /></svg>';

    const result = await exportHeatmapAsImage({
      element: mockElement,
      filename: 'custom-export',
      format: 'png',
      quality: 0.9,
      backgroundColor: '#ffffff',
      scale: 2,
    });

    expect(result.success).toBe(true);
    expect(result.filename).toBe('custom-export.png');
  });
});
