import { Request, Response } from '@casepilot/cqrs';
import type { Comment } from '../../domain/entities/comment.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateCommentData {
  readonly authorMemberId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly body: string;
}
export interface UpdateCommentData {
  readonly authorMemberId?: string;
  readonly targetType?: string;
  readonly targetId?: string;
  readonly body?: string;
}
export class CommentResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly authorMemberId: string,
    public readonly targetType: string,
    public readonly targetId: string,
    public readonly body: string,
  ) { super(); }
}
export function toCommentResponse(entity: Comment): CommentResponse {
  return new CommentResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.authorMemberId, entity.targetType, entity.targetId, entity.body);
}
export class CreateCommentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCommentData) { super(); }
}
export class CreateCommentResponse extends Response {
  constructor(public readonly item: CommentResponse) { super(); }
}
export class GetCommentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCommentResponse extends Response {
  constructor(public readonly item: CommentResponse) { super(); }
}
export class UpdateCommentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCommentData) { super(); }
}
export class UpdateCommentResponse extends Response {
  constructor(public readonly item: CommentResponse) { super(); }
}
export class DeleteCommentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCommentResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCommentsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCommentsResponse extends Response {
  constructor(public readonly items: readonly CommentResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
