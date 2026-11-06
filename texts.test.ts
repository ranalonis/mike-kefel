import { describe, expect, it } from "vitest";
import { greeting } from "./texts";

describe("greeting by hour", () => {
  it.each([
    [4, "ערב טוב מייקי"],
    [5, "בוקר טוב מייקי"],
    [11, "בוקר טוב מייקי"],
    [12, "יום טוב מייקי"],
    [16, "יום טוב מייקי"],
    [17, "ערב טוב מייקי"],
    [23, "ערב טוב מייקי"],
    [0, "ערב טוב מייקי"],
  ])("%i:00 → %s", (hour, text) => {
    expect(greeting(hour)).toBe(text);
  });
});
