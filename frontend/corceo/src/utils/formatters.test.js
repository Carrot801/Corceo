import { describe, expect, test } from "vitest";
import { formatValue } from "./formatters";

describe("formatValue", () => {
  test("returns a dash for an empty value", () => {
    expect(formatValue(null)).toBe("—");
    expect(formatValue(undefined)).toBe("—");
    expect(formatValue("")).toBe("—");
  });

  test("returns text when the value is not numeric", () => {
    expect(formatValue("Revenue")).toBe("Revenue");
  });

  test("formats a number with two decimal places", () => {
    const result = formatValue(1234.567, {
      decimalPlaces: 2,
      useThousandsSeparator: false,
    });

    expect(result).toBe("1234.57");
  });

  test("formats currency", () => {
    const result = formatValue(1500, {
      locale: "en-US",
      numberFormat: "currency",
      currency: "USD",
      decimalPlaces: 2,
    });

    expect(result).toContain("$");
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  test("formats a whole-number percentage", () => {
    const result = formatValue(25, {
      numberFormat: "percentage",
      percentageInputMode: "whole",
      decimalPlaces: 0,
    });

    expect(result).toBe("25%");
  });

  test("calculates percentage from total", () => {
    const result = formatValue(
      25,
      {
        numberFormat: "percentage",
        percentageInputMode: "total",
        decimalPlaces: 0,
      },
      100
    );

    expect(result).toBe("25%");
  });

  test("uses parentheses for negative numbers", () => {
    const result = formatValue(-500, {
      decimalPlaces: 0,
      useThousandsSeparator: false,
      negativeNumberStyle: "parentheses",
    });

    expect(result).toBe("(500)");
  });
});