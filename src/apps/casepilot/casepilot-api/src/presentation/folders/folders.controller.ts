import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateFolderHandler } from '../../application/folders/create-folder.handler.js';
import { GetFolderHandler } from '../../application/folders/get-folder.handler.js';
import { UpdateFolderHandler } from '../../application/folders/update-folder.handler.js';
import { DeleteFolderHandler } from '../../application/folders/delete-folder.handler.js';
import { ListFoldersHandler } from '../../application/folders/list-folders.handler.js';
import { CreateFolderRequest, GetFolderRequest, UpdateFolderRequest, DeleteFolderRequest, ListFoldersRequest } from '../../application/folders/folder.models.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { FolderItemHttpResponse, FoldersPageHttpResponse, DeleteFolderHttpResponse, toFolderHttpResponse } from './folder-http.response.js';

@Controller('business-accounts/:businessAccountId/folders')
export class FoldersController {
  constructor(
    @Inject(CreateFolderHandler) private readonly createHandler: CreateFolderHandler,
    @Inject(GetFolderHandler) private readonly getHandler: GetFolderHandler,
    @Inject(UpdateFolderHandler) private readonly updateHandler: UpdateFolderHandler,
    @Inject(DeleteFolderHandler) private readonly deleteHandler: DeleteFolderHandler,
    @Inject(ListFoldersHandler) private readonly listHandler: ListFoldersHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<FolderItemHttpResponse> {
    const body = readBody(input, ['caseId', 'parentFolderId', 'name', 'createdByMemberId']);
    const response = await this.createHandler.execute(new CreateFolderRequest(businessAccountId, {
      caseId: nullableString(body, 'caseId'),
      parentFolderId: nullableString(body, 'parentFolderId'),
      name: stringValue(body, 'name'),
      createdByMemberId: stringValue(body, 'createdByMemberId'),
    }));
    return new FolderItemHttpResponse(toFolderHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<FoldersPageHttpResponse> {
    const response = await this.listHandler.execute(new ListFoldersRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new FoldersPageHttpResponse(response.items.map(toFolderHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<FolderItemHttpResponse> {
    const response = await this.getHandler.execute(new GetFolderRequest(businessAccountId, id));
    return new FolderItemHttpResponse(toFolderHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<FolderItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'parentFolderId', 'name', 'createdByMemberId']);
    const response = await this.updateHandler.execute(new UpdateFolderRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: nullableString(body, 'caseId'),
      parentFolderId: nullableString(body, 'parentFolderId'),
      name: optionalString(body, 'name'),
      createdByMemberId: optionalString(body, 'createdByMemberId'),
    }));
    return new FolderItemHttpResponse(toFolderHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteFolderHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteFolderRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteFolderHttpResponse(response.id, response.deleted);
  }
}
