import { Module } from '@nestjs/common';
import { PineconeService } from './pinecone.service';
import { PineconeController } from './pinecone.controller';
import { PineconeRepository } from './pinecone.repository';

@Module({
  controllers: [PineconeController],
  providers: [PineconeService, PineconeRepository],
})
export class PineconeModule {}
