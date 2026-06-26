import { describe, it, expect } from "vitest";
import { parseMultiSource, decodeHtmlEntities, parseMultiSourceCache } from "./inventory-utils";

describe("parseMultiSource", () => {
  it("returns [] for null/empty/undefined", () => {
    expect(parseMultiSource(null)).toEqual([]);
    expect(parseMultiSource(undefined)).toEqual([]);
    expect(parseMultiSource("")).toEqual([]);
  });

  it("parses a valid JSON array of {source, qty} objects and returns them sorted by source", () => {
    const json = JSON.stringify([
      { source: "C", qty: "10", color: "red" },
      { source: "A", qty: "20", color: "blue" },
      { source: "B", qty: "30", color: "green" },
    ]);
    const result = parseMultiSource(json);
    expect(result).toEqual([
      { source: "A", qty: "20", color: "blue" },
      { source: "B", qty: "30", color: "green" },
      { source: "C", qty: "10", color: "red" },
    ]);
  });

  it("returns [] for a plain number or numeric string", () => {
    expect(parseMultiSource(42)).toEqual([]);
    expect(parseMultiSource("55")).toEqual([]);
  });

  it("returns a single Default entry for invalid JSON", () => {
    expect(parseMultiSource("12abc")).toEqual([
      { source: "Default", qty: 12, color: "bg-gray-100 text-gray-800 border-gray-200" }
    ]);
  });

  it("returns fresh COPIES each call (verifying cache safety)", () => {
    const input = JSON.stringify([{ source: "Test", qty: "10" }]);
    const firstCall = parseMultiSource(input);
    
    // Mutate the result
    firstCall[0].qty = "99";
    
    // Second call should not have the mutated value
    const secondCall = parseMultiSource(input);
    expect(secondCall[0].qty).toEqual("10");
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes &amp; &lt; &gt; &quot; and &#39; correctly", () => {
    expect(decodeHtmlEntities("A &amp; B")).toEqual("A & B");
    expect(decodeHtmlEntities("&lt;tag&gt;")).toEqual("<tag>");
    expect(decodeHtmlEntities("&quot;hello&quot;")).toEqual('"hello"');
    expect(decodeHtmlEntities("it&#39;s")).toEqual("it's");
  });

  it("returns the input unchanged when there are no entities", () => {
    expect(decodeHtmlEntities("hello world")).toEqual("hello world");
  });

  it("safely handles empty/null input", () => {
    expect(decodeHtmlEntities(null as any)).toEqual(null);
    expect(decodeHtmlEntities("")).toEqual("");
    expect(decodeHtmlEntities(undefined as any)).toEqual(undefined);
  });
});
