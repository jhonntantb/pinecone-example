import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { loadQAStuffChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RetrievalQAChain } from 'langchain/chains';

@Injectable()
export class PineconeRepository {
  private readonly apiToken = process.env.PINECONE_API_KEY;
  private readonly openaiApiToken = process.env.OPENAI_SECRET_KEY;
  private readonly indexDocumentName = process.env.PINECONE_INDEX_NAME_DOCUMENT;
  private readonly embedding: OpenAIEmbeddings;
  private readonly pc: Pinecone;
  constructor() {
    this.pc = new Pinecone({
      apiKey: this.apiToken,
    });
    this.embedding = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      dimensions: 1536,
      openAIApiKey: process.env.OPENAI_SECRET_KEY,
    });
  }

  async loadAndUpsertDocument(documentName: string) {
    try {
      const loader = new PDFLoader(`./documents/${documentName}`);
      const document = await loader.load();
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
      });
      const splits = await textSplitter.splitDocuments(document);

      const docs = splits.map(
        (text) =>
          new Document({
            pageContent: text.pageContent,
          }),
      );
      const index = this.pc.Index(this.indexDocumentName);
      await PineconeStore.fromDocuments(docs, this.embedding, {
        pineconeIndex: index,
        maxConcurrency: 5,
        namespace: 'document',
      });
      return 'Documento cargado exitosamente';
    } catch (error) {
      throw new Error('Ocurrio un error algo al cargar el documento');
    }
  }
  async upsertPulseVector(text: string, indexName: string) {
    try {
      const index = this.pc.Index(indexName);
      const doc = new Document({
        pageContent: text,
      });

      await PineconeStore.fromDocuments([doc], this.embedding, {
        pineconeIndex: index,
        maxConcurrency: 5,
        namespace: 'document',
      });
    } catch (error) {
      console.log(error);
    }
  }
  async searchSimilarityByCosine(query: string) {
    const response = await this.searchSimilarityVector(
      query,
      this.indexDocumentName,
      'document',
    );
    return response;
  }
  async searchSimilarityVector(
    query: string,
    indexName: string,
    namespace: string,
  ) {
    const pineconeIndex = this.pc.Index(indexName);
    const vectorStore = await PineconeStore.fromExistingIndex(this.embedding, {
      pineconeIndex,
      namespace: namespace,
    });
    const result = await vectorStore.similaritySearch(query, 3);
    return result;
  }
  async searchCosineByLLM(query: string) {
    return await this.searchSimilarityByLMM(query, this.indexDocumentName);
  }
  async searchSimilarityByLMM(query: string, indexName: string) {
    const pineconeIndex = this.pc.Index(indexName);
    const queryEmbedding = await this.embedding.embedQuery(query);

    const queryResponse = await pineconeIndex.namespace('document').query({
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    });
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      openAIApiKey: this.openaiApiToken,
      temperature: 1,
    });
    const chain = loadQAStuffChain(model);
    const concatPageContent = queryResponse.matches
      .map((match) => match.metadata.text)
      .join('');
    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatPageContent })],
      question: query,
    });
    return result;
  }

  async queryCosineAndMemory(query: string) {
    const loader = new PDFLoader(`./documents/habitos-atomicos.pdf`);
    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const splittedDocs = await textSplitter.splitDocuments(docs);

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splittedDocs,
      this.embedding,
    );
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      apiKey: this.openaiApiToken,
    });
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    //Change the query to the question you want to ask
    const response = await chain.invoke({
      query: query,
    });
    return response;
  }
  async deleteAllRecordsByNamespace(indexName: string, namespace: string) {
    const pineconeIndex = this.pc.Index(indexName);
    await pineconeIndex.namespace(namespace).deleteAll();
  }
}
