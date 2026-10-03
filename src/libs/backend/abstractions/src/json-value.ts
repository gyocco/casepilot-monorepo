export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** JSON-compatible data only; bounded traversal rejects cycles and exotic objects. */
export function isJsonValue(value: unknown, maxDepth = 100): value is JsonValue {
  function visit(input: unknown, depth: number, ancestors: Set<object>): boolean {
    if (depth > maxDepth) return false;
    if (input === null || typeof input === 'string' || typeof input === 'boolean') return true;
    if (typeof input === 'number') return Number.isFinite(input);
    if (typeof input !== 'object' || ancestors.has(input)) return false;
    const prototype: unknown = Object.getPrototypeOf(input);
    if (!Array.isArray(input) && prototype !== Object.prototype && prototype !== null) return false;
    const next = new Set(ancestors).add(input);
    return Object.values(input).every(item => visit(item, depth + 1, next));
  }
  return visit(value, 0, new Set());
}
