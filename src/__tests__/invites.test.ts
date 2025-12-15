import { describe, it, expect } from "vitest";
import { getInviteCodeById, inviteCodes } from "@/data/invites";
import { groupInviteCodesByCategory } from "@/lib/invites";

describe("invites data", () => {
  it("includes Setapp invite", () => {
    const code = getInviteCodeById("setapp");
    expect(code).toBeDefined();
    expect(code?.platform).toBe("Setapp");
    expect(code?.url).toBe("https://go.setapp.com/invite/v5w477nm");
  });

  it("is grouped into productivity-tools", () => {
    const grouped = groupInviteCodesByCategory(inviteCodes);
    const productivity = grouped.get("productivity-tools");

    expect(productivity).toBeDefined();
    expect(productivity?.some((c: any) => c.id === "setapp")).toBe(true);
  });
});
