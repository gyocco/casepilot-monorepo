import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCommentHandler } from '../../application/comments/create-comment.handler.js';
import { GetCommentHandler } from '../../application/comments/get-comment.handler.js';
import { UpdateCommentHandler } from '../../application/comments/update-comment.handler.js';
import { DeleteCommentHandler } from '../../application/comments/delete-comment.handler.js';
import { ListCommentsHandler } from '../../application/comments/list-comments.handler.js';
import { CreateCommentRequest, GetCommentRequest, UpdateCommentRequest, DeleteCommentRequest, ListCommentsRequest } from '../../application/comments/comment.models.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { CommentItemHttpResponse, CommentsPageHttpResponse, DeleteCommentHttpResponse, toCommentHttpResponse } from './comment-http.response.js';

@Controller('business-accounts/:businessAccountId/comments')
export class CommentsController {
  constructor(
    @Inject(CreateCommentHandler) private readonly createHandler: CreateCommentHandler,
    @Inject(GetCommentHandler) private readonly getHandler: GetCommentHandler,
    @Inject(UpdateCommentHandler) private readonly updateHandler: UpdateCommentHandler,
    @Inject(DeleteCommentHandler) private readonly deleteHandler: DeleteCommentHandler,
    @Inject(ListCommentsHandler) private readonly listHandler: ListCommentsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CommentItemHttpResponse> {
    const body = readBody(input, ['authorMemberId', 'targetType', 'targetId', 'body']);
    const response = await this.createHandler.execute(new CreateCommentRequest(businessAccountId, {
      authorMemberId: stringValue(body, 'authorMemberId'),
      targetType: stringValue(body, 'targetType'),
      targetId: stringValue(body, 'targetId'),
      body: stringValue(body, 'body'),
    }));
    return new CommentItemHttpResponse(toCommentHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<CommentsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCommentsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new CommentsPageHttpResponse(response.items.map(toCommentHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CommentItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCommentRequest(businessAccountId, id));
    return new CommentItemHttpResponse(toCommentHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CommentItemHttpResponse> {
    const body = readBody(input, ['version', 'authorMemberId', 'targetType', 'targetId', 'body']);
    const response = await this.updateHandler.execute(new UpdateCommentRequest(businessAccountId, id, numberValue(body, 'version'), {
      authorMemberId: optionalString(body, 'authorMemberId'),
      targetType: optionalString(body, 'targetType'),
      targetId: optionalString(body, 'targetId'),
      body: optionalString(body, 'body'),
    }));
    return new CommentItemHttpResponse(toCommentHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCommentHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCommentRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteCommentHttpResponse(response.id, response.deleted);
  }
}
