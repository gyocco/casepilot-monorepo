import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateDocumentVersionHandler } from '../../application/document-versions/create-document-version.handler.js';
import { GetDocumentVersionHandler } from '../../application/document-versions/get-document-version.handler.js';
import { UpdateDocumentVersionHandler } from '../../application/document-versions/update-document-version.handler.js';
import { DeleteDocumentVersionHandler } from '../../application/document-versions/delete-document-version.handler.js';
import { ListDocumentVersionsHandler } from '../../application/document-versions/list-document-versions.handler.js';
import { CreateDocumentVersionRequest, GetDocumentVersionRequest, UpdateDocumentVersionRequest, DeleteDocumentVersionRequest, ListDocumentVersionsRequest } from '../../application/document-versions/document-version.models.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, optionalNumber, nullableString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { DocumentVersionItemHttpResponse, DocumentVersionsPageHttpResponse, DeleteDocumentVersionHttpResponse, toDocumentVersionHttpResponse } from './document-version-http.response.js';

@Controller('business-accounts/:businessAccountId/document-versions')
export class DocumentVersionsController {
  constructor(
    @Inject(CreateDocumentVersionHandler) private readonly createHandler: CreateDocumentVersionHandler,
    @Inject(GetDocumentVersionHandler) private readonly getHandler: GetDocumentVersionHandler,
    @Inject(UpdateDocumentVersionHandler) private readonly updateHandler: UpdateDocumentVersionHandler,
    @Inject(DeleteDocumentVersionHandler) private readonly deleteHandler: DeleteDocumentVersionHandler,
    @Inject(ListDocumentVersionsHandler) private readonly listHandler: ListDocumentVersionsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<DocumentVersionItemHttpResponse> {
    const body = readBody(input, ['documentId', 'versionNumber', 'storageKey', 'fileName', 'mimeType', 'sizeBytes', 'checksum', 'uploadedByMemberId']);
    const response = await this.createHandler.execute(new CreateDocumentVersionRequest(businessAccountId, {
      documentId: stringValue(body, 'documentId'),
      versionNumber: numberValue(body, 'versionNumber'),
      storageKey: stringValue(body, 'storageKey'),
      fileName: stringValue(body, 'fileName'),
      mimeType: stringValue(body, 'mimeType'),
      sizeBytes: stringValue(body, 'sizeBytes'),
      checksum: nullableString(body, 'checksum'),
      uploadedByMemberId: stringValue(body, 'uploadedByMemberId'),
    }));
    return new DocumentVersionItemHttpResponse(toDocumentVersionHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<DocumentVersionsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListDocumentVersionsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new DocumentVersionsPageHttpResponse(response.items.map(toDocumentVersionHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<DocumentVersionItemHttpResponse> {
    const response = await this.getHandler.execute(new GetDocumentVersionRequest(businessAccountId, id));
    return new DocumentVersionItemHttpResponse(toDocumentVersionHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<DocumentVersionItemHttpResponse> {
    const body = readBody(input, ['version', 'documentId', 'versionNumber', 'storageKey', 'fileName', 'mimeType', 'sizeBytes', 'checksum', 'uploadedByMemberId']);
    const response = await this.updateHandler.execute(new UpdateDocumentVersionRequest(businessAccountId, id, numberValue(body, 'version'), {
      documentId: optionalString(body, 'documentId'),
      versionNumber: optionalNumber(body, 'versionNumber'),
      storageKey: optionalString(body, 'storageKey'),
      fileName: optionalString(body, 'fileName'),
      mimeType: optionalString(body, 'mimeType'),
      sizeBytes: optionalString(body, 'sizeBytes'),
      checksum: nullableString(body, 'checksum'),
      uploadedByMemberId: optionalString(body, 'uploadedByMemberId'),
    }));
    return new DocumentVersionItemHttpResponse(toDocumentVersionHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteDocumentVersionHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteDocumentVersionRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteDocumentVersionHttpResponse(response.id, response.deleted);
  }
}
