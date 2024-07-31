import { Injectable } from '@nestjs/common';
import { PineconeRepository } from './pinecone.repository';
@Injectable()
export class PineconeService {
  constructor(private readonly pineconeRepository: PineconeRepository) {}
  async createCosineExample() {
    return await this.pineconeRepository.loadAndUpsertDocument();
  }

  async cosineQueryProject(query: string) {
    return await this.pineconeRepository.searchSimilarityByCosine(query);
  }

  async cosineQueryProjectLLM(query: string) {
    return await this.pineconeRepository.searchCosineByLLM(query);
  }

  upsertTextData(text: string) {
    return `This action returns a #${text} pinecone`;
  }

  queryTextData(query: string) {
    return `This action updates a #${query} pinecone`;
  }

  async deleteIndexByNamespace(indexName: string, namespace: string) {
    return await this.pineconeRepository.deleteAllRecordsByNamespace(
      indexName,
      namespace,
    );
  }
}
