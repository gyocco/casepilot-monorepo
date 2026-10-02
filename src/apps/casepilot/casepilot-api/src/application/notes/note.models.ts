import { Request, Response } from '@casepilot/cqrs';
import type { Note } from '../../domain/entities/note.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateNoteData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly authorMemberId: string;
  readonly title?: string | null;
  readonly body: string;
  readonly isPrivate: boolean;
}
export interface UpdateNoteData {
  readonly caseId?: string | null;
  readonly externalPartyId?: string | null;
  readonly authorMemberId?: string;
  readonly title?: string | null;
  readonly body?: string;
  readonly isPrivate?: boolean;
}
export class NoteResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string | null,
    public readonly externalPartyId: string | null,
    public readonly authorMemberId: string,
    public readonly title: string | null,
    public readonly body: string,
    public readonly isPrivate: boolean,
  ) { super(); }
}
export function toNoteResponse(entity: Note): NoteResponse {
  return new NoteResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.externalPartyId, entity.authorMemberId, entity.title, entity.body, entity.isPrivate);
}
export class CreateNoteRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateNoteData) { super(); }
}
export class CreateNoteResponse extends Response {
  constructor(public readonly item: NoteResponse) { super(); }
}
export class GetNoteRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetNoteResponse extends Response {
  constructor(public readonly item: NoteResponse) { super(); }
}
export class UpdateNoteRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateNoteData) { super(); }
}
export class UpdateNoteResponse extends Response {
  constructor(public readonly item: NoteResponse) { super(); }
}
export class DeleteNoteRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteNoteResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListNotesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListNotesResponse extends Response {
  constructor(public readonly items: readonly NoteResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
