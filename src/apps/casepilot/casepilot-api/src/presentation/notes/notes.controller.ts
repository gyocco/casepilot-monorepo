import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateNoteHandler } from '../../application/notes/create-note.handler.js';
import { GetNoteHandler } from '../../application/notes/get-note.handler.js';
import { UpdateNoteHandler } from '../../application/notes/update-note.handler.js';
import { DeleteNoteHandler } from '../../application/notes/delete-note.handler.js';
import { ListNotesHandler } from '../../application/notes/list-notes.handler.js';
import { CreateNoteRequest, GetNoteRequest, UpdateNoteRequest, DeleteNoteRequest, ListNotesRequest } from '../../application/notes/note.models.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { NoteItemHttpResponse, NotesPageHttpResponse, DeleteNoteHttpResponse, toNoteHttpResponse } from './note-http.response.js';

@Controller('business-accounts/:businessAccountId/notes')
export class NotesController {
  constructor(
    @Inject(CreateNoteHandler) private readonly createHandler: CreateNoteHandler,
    @Inject(GetNoteHandler) private readonly getHandler: GetNoteHandler,
    @Inject(UpdateNoteHandler) private readonly updateHandler: UpdateNoteHandler,
    @Inject(DeleteNoteHandler) private readonly deleteHandler: DeleteNoteHandler,
    @Inject(ListNotesHandler) private readonly listHandler: ListNotesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<NoteItemHttpResponse> {
    const body = readBody(input, ['caseId', 'externalPartyId', 'authorMemberId', 'title', 'body', 'isPrivate']);
    const response = await this.createHandler.execute(new CreateNoteRequest(businessAccountId, {
      caseId: nullableString(body, 'caseId'),
      externalPartyId: nullableString(body, 'externalPartyId'),
      authorMemberId: stringValue(body, 'authorMemberId'),
      title: nullableString(body, 'title'),
      body: stringValue(body, 'body'),
      isPrivate: booleanValue(body, 'isPrivate'),
    }));
    return new NoteItemHttpResponse(toNoteHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<NotesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListNotesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new NotesPageHttpResponse(response.items.map(toNoteHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<NoteItemHttpResponse> {
    const response = await this.getHandler.execute(new GetNoteRequest(businessAccountId, id));
    return new NoteItemHttpResponse(toNoteHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<NoteItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'externalPartyId', 'authorMemberId', 'title', 'body', 'isPrivate']);
    const response = await this.updateHandler.execute(new UpdateNoteRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: nullableString(body, 'caseId'),
      externalPartyId: nullableString(body, 'externalPartyId'),
      authorMemberId: optionalString(body, 'authorMemberId'),
      title: nullableString(body, 'title'),
      body: optionalString(body, 'body'),
      isPrivate: optionalBoolean(body, 'isPrivate'),
    }));
    return new NoteItemHttpResponse(toNoteHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteNoteHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteNoteRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteNoteHttpResponse(response.id, response.deleted);
  }
}
