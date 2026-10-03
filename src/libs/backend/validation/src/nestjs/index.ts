import { BadRequestException } from '@nestjs/common';
import { isJsonValue, type JsonValue } from '@casepilot/abstractions';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export function readBody(value: unknown, fields: readonly string[]): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('A JSON object is required.');
  const result: Record<string, unknown> = {};
  for (const [key, input] of Object.entries(value)) {
    if (!fields.includes(key)) throw new BadRequestException('Unknown or immutable field.');
    result[key] = input;
  }
  return result;
}
export function stringValue(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== 'string') throw new BadRequestException('A string field is required.');
  return value;
}
export function optionalString(body: Record<string, unknown>, key: string): string | undefined {
  return body[key] === undefined ? undefined : stringValue(body, key);
}
export function nullableString(body: Record<string, unknown>, key: string): string | null | undefined {
  return body[key] === null ? null : optionalString(body, key);
}
export function numberValue(body: Record<string, unknown>, key: string): number {
  const value = body[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new BadRequestException('A numeric field is required.');
  return value;
}
export function optionalNumber(body: Record<string, unknown>, key: string): number | undefined {
  return body[key] === undefined ? undefined : numberValue(body, key);
}
export function nullableNumber(body: Record<string, unknown>, key: string): number | null | undefined {
  return body[key] === null ? null : optionalNumber(body, key);
}
export function booleanValue(body: Record<string, unknown>, key: string): boolean {
  const value = body[key];
  if (typeof value !== 'boolean') throw new BadRequestException('A boolean field is required.');
  return value;
}
export function optionalBoolean(body: Record<string, unknown>, key: string): boolean | undefined {
  return body[key] === undefined ? undefined : booleanValue(body, key);
}
export function nullableBoolean(body: Record<string, unknown>, key: string): boolean | null | undefined {
  return body[key] === null ? null : optionalBoolean(body, key);
}
export function nullableJson(body: Record<string, unknown>, key: string, maxDepth = 20): JsonValue | undefined {
  const value = body[key];
  if (value === undefined) return undefined;
  if (!isJsonValue(value, maxDepth)) throw new BadRequestException('A JSON value is required.');
  return value;
}
export function choiceValue<T extends string>(body: Record<string, unknown>, key: string, choices: readonly T[]): T {
  for (const choice of choices) if (choice === body[key]) return choice;
  throw new BadRequestException('Unsupported field value.');
}
export function optionalChoice<T extends string>(body: Record<string, unknown>, key: string, choices: readonly T[]): T | undefined {
  return body[key] === undefined ? undefined : choiceValue(body, key, choices);
}
export function nullableChoice<T extends string>(body: Record<string, unknown>, key: string, choices: readonly T[]): T | null | undefined {
  return body[key] === null ? null : optionalChoice(body, key, choices);
}
export function numberQuery(value: string | undefined, fallback?: number): number {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new BadRequestException('An integer query parameter is required.');
  const result = Number(value);
  if (!Number.isSafeInteger(result)) throw new BadRequestException('Integer query parameter is out of range.');
  return result;
}
export function textQuery(value: string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') throw new BadRequestException('A string query parameter is required.');
  return value;
}
export class PageMetadataHttpResponse {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  constructor(response: PageMetadataResponse) {
    this.pageNumber = response.pageNumber;
    this.pageSize = response.pageSize;
    this.totalCount = response.totalCount;
    this.totalPages = response.totalPages;
    this.hasNextPage = response.hasNextPage;
    this.hasPreviousPage = response.hasPreviousPage;
  }
}
