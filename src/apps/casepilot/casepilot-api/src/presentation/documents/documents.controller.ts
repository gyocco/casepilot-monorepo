import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateDocumentHandler } from '../../application/documents/create-document.handler.js';
import { GetDocumentHandler } from '../../application/documents/get-document.handler.js';
import { UpdateDocumentHandler } from '../../application/documents/update-document.handler.js';
import { DeleteDocumentHandler } from '../../application/documents/delete-document.handler.js';
import { ListDocumentsHandler } from '../../application/documents/list-documents.handler.js';
import { CreateDocumentRequest, GetDocumentRequest, UpdateDocumentRequest, DeleteDocumentRequest, ListDocumentsRequest } from '../../application/documents/document.models.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { DocumentItemHttpResponse, DocumentsPageHttpResponse, DeleteDocumentHttpResponse, toDocumentHttpResponse } from './document-http.response.js';

@Controller('business-accounts/:businessAccountId/documents')
export class DocumentsController {
  constructor(
    @Inject(CreateDocumentHandler) private readonly createHandler: CreateDocumentHandler,
    @Inject(GetDocumentHandler) private readonly getHandler: GetDocumentHandler,
    @Inject(UpdateDocumentHandler) private readonly updateHandler: UpdateDocumentHandler,
    @Inject(DeleteDocumentHandler) private readonly deleteHandler: DeleteDocumentHandler,
    @Inject(ListDocumentsHandler) private readonly listHandler: ListDocumentsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<DocumentItemHttpResponse> {
    const body = readBody(input, ['caseId', 'externalPartyId', 'folderId', 'name', 'description', 'documentType', 'currentVersionId', 'createdByMemberId']);
    const response = await this.createHandler.execute(new CreateDocumentRequest(businessAccountId, {
      caseId: nullableString(body, 'caseId'),
      externalPartyId: nullableString(body, 'externalPartyId'),
      folderId: nullableString(body, 'folderId'),
      name: stringValue(body, 'name'),
      description: nullableString(body, 'description'),
      documentType: nullableString(body, 'documentType'),
      currentVersionId: nullableString(body, 'currentVersionId'),
      createdByMemberId: stringValue(body, 'createdByMemberId'),
    }));
    return new DocumentItemHttpResponse(toDocumentHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<DocumentsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListDocumentsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new DocumentsPageHttpResponse(response.items.map(toDocumentHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<DocumentItemHttpResponse> {
    const response = await this.getHandler.execute(new GetDocumentRequest(businessAccountId, id));
    return new DocumentItemHttpResponse(toDocumentHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<DocumentItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'externalPartyId', 'folderId', 'name', 'description', 'documentType', 'currentVersionId', 'createdByMemberId']);
    const response = await this.updateHandler.execute(new UpdateDocumentRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: nullableString(body, 'caseId'),
      externalPartyId: nullableString(body, 'externalPartyId'),
      folderId: nullableString(body, 'folderId'),
      name: optionalString(body, 'name'),
      description: nullableString(body, 'description'),
      documentType: nullableString(body, 'documentType'),
      currentVersionId: nullableString(body, 'currentVersionId'),
      createdByMemberId: optionalString(body, 'createdByMemberId'),
    }));
    return new DocumentItemHttpResponse(toDocumentHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteDocumentHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteDocumentRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteDocumentHttpResponse(response.id, response.deleted);
  }
}
