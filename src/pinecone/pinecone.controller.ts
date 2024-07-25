import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { PineconeService } from './pinecone.service';

@Controller('pinecone')
export class PineconeController {
  constructor(private readonly pineconeService: PineconeService) {}

  @Post('cosine')
  createCosineExample() {
    //subir un archivo de para realizar el trabajo
    return this.pineconeService.createCosineExample();
  }

  @Post('cosine/query')
  cosineQueryProject(@Body('query') query: string) {
    return this.pineconeService.cosineQueryProject(query);
  }

  @Post('text')
  upsertTextData(@Body('text') text: string) {
    return this.pineconeService.upsertTextData(text);
  }

  @Post('text/query')
  queryTextData(@Body('query') query: string) {
    return this.pineconeService.queryTextData(query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pineconeService.remove(+id);
  }
}
