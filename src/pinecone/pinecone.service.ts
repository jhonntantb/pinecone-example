import { Injectable } from '@nestjs/common';
import { PineconeRepository } from './pinecone.repository';
@Injectable()
export class PineconeService {
  constructor(private readonly pineconeRepository: PineconeRepository) {}
  async createCosineExample() {
    return await this.pineconeRepository.loadAndUpsertDocument();
  }

  cosineQueryProject(query: string) {
    return `This action returns all pinecone ${query}`;
  }

  upsertTextData(text: string) {
    return `This action returns a #${text} pinecone`;
  }

  queryTextData(query: string) {
    return `This action updates a #${query} pinecone`;
  }

  remove(id: number) {
    return `This action removes a #${id} pinecone`;
  }
}
