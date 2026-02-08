import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { dateKeyFromOffset, toDateKey } from "./logs";

describe("logs date helpers", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("toDateKey returns YYYY-MM-DD", () => {
    const value = new Date(2026, 1, 8, 12, 30, 0);
    expect(toDateKey(value)).toBe("2026-02-08");
  });

  test("dateKeyFromOffset uses current date offset", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 1, 8, 10, 0, 0));
    expect(dateKeyFromOffset(-1)).toBe("2026-02-07");
    expect(dateKeyFromOffset(0)).toBe("2026-02-08");
    expect(dateKeyFromOffset(2)).toBe("2026-02-10");
  });
});
