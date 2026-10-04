import type { NoteResponse } from '../../application/notes/shared/note.response.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class NoteHttpResponse {
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
  ) {}
}
export function toNoteHttpResponse(item: NoteResponse): NoteHttpResponse {
  return new NoteHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.externalPartyId, item.authorMemberId, item.title, item.body, item.isPrivate);
}
export class NoteItemHttpResponse {
  constructor(public readonly item: NoteHttpResponse) {}
}
export class NotesPageHttpResponse {
  constructor(public readonly items: readonly NoteHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteNoteHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
