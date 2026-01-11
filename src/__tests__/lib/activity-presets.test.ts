import { describe, it, expect, beforeEach } from "vitest";
import {
  loadPresets,
  savePresets,
  createPreset,
  updatePreset,
  deletePreset,
  markPresetUsed,
  reorderPresets,
  exportPresets,
  importPresets,
  DEFAULT_PRESETS,
  type ActivityFilterPreset,
} from "@/lib/activity";

describe("Activity Filter Presets", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("loadPresets", () => {
    it("returns default presets when localStorage is empty", () => {
      const presets = loadPresets();
      expect(presets).toEqual(DEFAULT_PRESETS);
    });

    it("merges user presets with defaults", () => {
      const userPreset = createPreset("My Custom", ["blog"], "week");
      savePresets([...DEFAULT_PRESETS, userPreset]);

      const loaded = loadPresets();
      expect(loaded.length).toBe(DEFAULT_PRESETS.length + 1);
      expect(loaded.find((p) => p.id === userPreset.id)).toBeDefined();
    });

    it("handles invalid JSON gracefully", () => {
      localStorage.setItem("dcyfr-activity-presets", "invalid json");
      const presets = loadPresets();
      expect(presets).toEqual(DEFAULT_PRESETS);
    });

    it("handles version mismatch gracefully", () => {
      localStorage.setItem(
        "dcyfr-activity-presets",
        JSON.stringify({ version: 999, presets: [], lastModified: Date.now() })
      );
      const presets = loadPresets();
      expect(presets).toEqual(DEFAULT_PRESETS);
    });
  });

  describe("savePresets", () => {
    it("saves only user presets to localStorage", () => {
      const userPreset = createPreset("My Custom", ["blog"], "week");
      const allPresets = [...DEFAULT_PRESETS, userPreset];

      savePresets(allPresets);

      const stored = localStorage.getItem("dcyfr-activity-presets");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.presets.length).toBe(1);
      expect(parsed.presets[0].id).toBe(userPreset.id);
    });

    it("includes version and timestamp", () => {
      savePresets([]);

      const stored = localStorage.getItem("dcyfr-activity-presets");
      const parsed = JSON.parse(stored!);

      expect(parsed.version).toBe(1);
      expect(parsed.lastModified).toBeTypeOf("number");
    });
  });

  describe("createPreset", () => {
    it("creates a preset with unique ID", () => {
      const preset1 = createPreset("Test 1", ["blog"], "week");
      const preset2 = createPreset("Test 2", ["project"], "month");

      expect(preset1.id).not.toBe(preset2.id);
    });

    it("creates preset with correct structure", () => {
      const preset = createPreset("My Preset", ["blog", "project"], "month");

      expect(preset.name).toBe("My Preset");
      expect(preset.filters.sources).toEqual(["blog", "project"]);
      expect(preset.filters.timeRange).toBe("month");
      expect(preset.isDefault).toBeUndefined();
      expect(preset.createdAt).toBeTypeOf("number");
    });
  });

  describe("updatePreset", () => {
    it("updates preset name", () => {
      const preset = createPreset("Old Name", ["blog"], "week");
      const presets = [preset];

      const updated = updatePreset(presets, preset.id, { name: "New Name" });

      expect(updated[0].name).toBe("New Name");
    });

    it("does not update default presets", () => {
      const defaultPreset = DEFAULT_PRESETS[0];
      const updated = updatePreset(DEFAULT_PRESETS, defaultPreset.id, {
        name: "Hacked",
      });

      expect(updated[0].name).toBe(defaultPreset.name);
    });

    it("updates lastUsedAt timestamp", () => {
      const preset = createPreset("Test", ["blog"], "week");
      const presets = [preset];

      const updated = updatePreset(presets, preset.id, {
        lastUsedAt: Date.now(),
      });

      expect(updated[0].lastUsedAt).toBeDefined();
    });
  });

  describe("deletePreset", () => {
    it("deletes user presets", () => {
      const userPreset = createPreset("My Preset", ["blog"], "week");
      const presets = [...DEFAULT_PRESETS, userPreset];

      const updated = deletePreset(presets, userPreset.id);

      expect(updated.length).toBe(DEFAULT_PRESETS.length);
      expect(updated.find((p) => p.id === userPreset.id)).toBeUndefined();
    });

    it("does not delete default presets", () => {
      const defaultPreset = DEFAULT_PRESETS[0];
      const updated = deletePreset(DEFAULT_PRESETS, defaultPreset.id);

      expect(updated.length).toBe(DEFAULT_PRESETS.length);
      expect(updated.find((p) => p.id === defaultPreset.id)).toBeDefined();
    });
  });

  describe("markPresetUsed", () => {
    it("updates lastUsedAt timestamp", () => {
      const preset = createPreset("Test", ["blog"], "week");
      const presets = [preset];

      const before = Date.now();
      const updated = markPresetUsed(presets, preset.id);
      const after = Date.now();

      expect(updated[0].lastUsedAt).toBeGreaterThanOrEqual(before);
      expect(updated[0].lastUsedAt).toBeLessThanOrEqual(after);
    });
  });

  describe("reorderPresets", () => {
    it("reorders user presets", () => {
      const preset1 = createPreset("Preset 1", ["blog"], "week");
      const preset2 = createPreset("Preset 2", ["project"], "month");
      const preset3 = createPreset("Preset 3", ["github"], "year");
      const presets = [...DEFAULT_PRESETS, preset1, preset2, preset3];

      const reordered = reorderPresets(presets, 0, 2);

      const userPresets = reordered.filter((p) => !p.isDefault);
      expect(userPresets[0].id).toBe(preset2.id);
      expect(userPresets[1].id).toBe(preset3.id);
      expect(userPresets[2].id).toBe(preset1.id);
    });

    it("does not affect default presets order", () => {
      const preset1 = createPreset("Preset 1", ["blog"], "week");
      const presets = [...DEFAULT_PRESETS, preset1];

      const reordered = reorderPresets(presets, 0, 0);

      const defaults = reordered.filter((p) => p.isDefault);
      expect(defaults.length).toBe(DEFAULT_PRESETS.length);
    });
  });

  describe("exportPresets", () => {
    it("exports only user presets as JSON", () => {
      const userPreset = createPreset("My Preset", ["blog"], "week");
      const presets = [...DEFAULT_PRESETS, userPreset];

      const json = exportPresets(presets);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe(1);
      expect(parsed.presets.length).toBe(1);
      expect(parsed.presets[0].id).toBe(userPreset.id);
      expect(parsed.exportedAt).toBeTypeOf("number");
    });

    it("exports formatted JSON", () => {
      const json = exportPresets([]);
      expect(json).toContain("\n"); // Should have newlines (formatted)
    });
  });

  describe("importPresets", () => {
    it("imports valid presets", () => {
      const preset1 = createPreset("Import 1", ["blog"], "week");
      const json = JSON.stringify({
        version: 1,
        presets: [preset1],
        exportedAt: Date.now(),
      });

      const result = importPresets(json, DEFAULT_PRESETS);

      expect(result.success).toBe(true);
      expect(result.presets?.length).toBe(DEFAULT_PRESETS.length + 1);
    });

    it("handles invalid JSON", () => {
      const result = importPresets("invalid json", DEFAULT_PRESETS);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("handles version mismatch", () => {
      const json = JSON.stringify({
        version: 999,
        presets: [],
        exportedAt: Date.now(),
      });

      const result = importPresets(json, DEFAULT_PRESETS);

      expect(result.success).toBe(false);
      expect(result.error).toContain("version");
    });

    it("avoids duplicate preset names", () => {
      const existing = createPreset("Duplicate", ["blog"], "week");
      const duplicate = createPreset("Duplicate", ["project"], "month");

      const json = JSON.stringify({
        version: 1,
        presets: [duplicate],
        exportedAt: Date.now(),
      });

      const result = importPresets(json, [existing]);

      expect(result.success).toBe(true);
      expect(result.presets?.length).toBe(1); // Should not add duplicate
    });

    it("removes default flag from imported presets", () => {
      const defaultLikePreset = {
        ...createPreset("Test", ["blog"], "week"),
        isDefault: true,
      };

      const json = JSON.stringify({
        version: 1,
        presets: [defaultLikePreset],
        exportedAt: Date.now(),
      });

      const result = importPresets(json, []);

      expect(result.success).toBe(true);
      expect(result.presets?.[0].isDefault).toBe(false);
    });
  });

  describe("DEFAULT_PRESETS", () => {
    it("includes expected default presets", () => {
      expect(DEFAULT_PRESETS.length).toBe(5);

      const names = DEFAULT_PRESETS.map((p) => p.name);
      expect(names).toContain("Bookmarked Items");
      expect(names).toContain("Code Projects");
      expect(names).toContain("Trending This Month");
      expect(names).toContain("Recent Blog Posts");
      expect(names).toContain("All Achievements");
    });

    it("all default presets have isDefault flag", () => {
      DEFAULT_PRESETS.forEach((preset) => {
        expect(preset.isDefault).toBe(true);
      });
    });

    it("all default presets have unique IDs", () => {
      const ids = DEFAULT_PRESETS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
