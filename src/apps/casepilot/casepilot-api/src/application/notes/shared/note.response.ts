import { Response } from '@casepilot/cqrs';
import type { Note } from '../../../domain/entities/note.js';

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
