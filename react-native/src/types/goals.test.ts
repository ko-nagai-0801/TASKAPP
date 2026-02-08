import { describe, expect, test } from "@jest/globals";
import { getWeekStartKey } from "./goals";

describe("getWeekStartKey", () => {
  test("returns same date when Monday is passed", () => {
    expect(getWeekStartKey(new Date("2026-02-02T12:00:00.000Z"))).toBe("2026-02-02");
  });

  test("maps Sunday to the previous Monday", () => {
    expect(getWeekStartKey(new Date("2026-02-08T12:00:00.000Z"))).toBe("2026-02-02");
  });
});
