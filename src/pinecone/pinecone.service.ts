import { Injectable } from '@nestjs/common';
import { PineconeRepository } from './pinecone.repository';
@Injectable()
export class PineconeService {
  constructor(private readonly pineconeRepository: PineconeRepository) {}
  async createCosineExample(documentName: string) {
    return await this.pineconeRepository.loadAndUpsertDocument(documentName);
  }

  async cosineQueryProject(query: string) {
    return await this.pineconeRepository.searchSimilarityByCosine(query);
  }

  async cosineQueryProjectLLM(query: string) {
    return await this.pineconeRepository.searchCosineByLLM(query);
  }

  upsertMemoryData(text: string) {
    return `This action returns a #${text} pinecone`;
  }

  async queryMemoryData(query: string) {
    return await this.pineconeRepository.queryCosineAndMemory(query);
  }

  async deleteIndexByNamespace(indexName: string, namespace: string) {
    return await this.pineconeRepository.deleteAllRecordsByNamespace(
      indexName,
      namespace,
    );
  }
}
