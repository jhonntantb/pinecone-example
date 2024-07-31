import {
  Controller,
  Post,
  Body,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { PineconeService } from './pinecone.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as pdf from 'pdf-parse';

@Controller('pinecone')
export class PineconeController {
  constructor(private readonly pineconeService: PineconeService) {}

  @Post('pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPDF(@UploadedFile() file: Express.Multer.File) {
    try {
      const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      };
      const data = await pdf(file.buffer, render_options);
      return {
        message: 'PDF file uploaded and content extracted successfully',
        content: data.text,
      };
    } catch (error) {
      console.error('Error al procesar el PDF:', error);
      return { message: 'Error al procesar el PDF', error: error.message };
    }
  }
  @Post('cosine')
  createCosineExample() {
    //subir un archivo de para realizar el trabajo
    return this.pineconeService.createCosineExample();
  }

  @Post('cosine/query')
  cosineQueryProject(@Body('query') query: string) {
    return this.pineconeService.cosineQueryProject(query);
  }

  @Post('cosine/LLM')
  cosineQueryLLM(@Body('query') text: string) {
    return this.pineconeService.cosineQueryProjectLLM(text);
  }
  @Post('text')
  upsertTextData(@Body('text') text: string) {
    return this.pineconeService.upsertTextData(text);
  }

  @Post('text/query')
  queryTextData(@Body('query') query: string) {
    return this.pineconeService.queryTextData(query);
  }

  @Delete('clean')
  deleteIndexByNamespace(
    @Query('namespace') namespace: string,
    @Query('indexName') indexName: string,
  ) {
    return this.pineconeService.deleteIndexByNamespace(indexName, namespace);
  }
}
