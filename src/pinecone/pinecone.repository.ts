import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
// import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { loadQAStuffChain } from 'langchain/chains';
//import { RetrievalQA } from "@langchain/chains";
@Injectable()
export class PineconeRepository {
  private readonly apiToken = process.env.PINECONE_API_KEY;
  private readonly indexDocumentName = process.env.PINECONE_INDEX_NAME_DOCUMENT;
  private readonly indexTextName = process.env.PINECONE_INDEX_NAME_TEXT;
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

  async loadAndUpsertDocument() {
    try {
      const loader = new PDFLoader('./documents/El_mundo_que_ella_deseaba.pdf');
      const document = await loader.load();
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
      });
      console.log(document.length);
      console.log(document[3]);
      const splits = await textSplitter.splitDocuments(document);
      console.log(splits.length);
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
      const docs = new Document({
        pageContent: text,
      });

      await PineconeStore.fromDocuments([docs], this.embedding, {
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
  async searchSimilarityByLMM(query: string, indexName: string) {
    const pineconeIndex = this.pc.Index(indexName);
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(query);

    const queryResponse = await pineconeIndex.query({
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true,
    });
    // const vectorStore = await PineconeStore.fromExistingIndex(this.embedding, {
    //   pineconeIndex,
    //   namespace: namespace,
    // });
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      openAIApiKey: this.apiToken,
      temperature: 1,
    });
    const chain = loadQAStuffChain(model);
    const concatPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join('');
    const result = await chain.call({
      input_document: [new Document({ pageContent: concatPageContent })],
      question: query,
    });
    return result;
    // const retriever = vectorStore.asRetriever({
    //   searchType: 'similarity',
    //   k: 1,
    // });
    // const selfQueryRetriever = RetrievalQAChain.fromLLM(model, retriever);
    // // const qa = ConversationalRetrievalQAChain.fromLLM(model, retriever);
    // // return qa;
  }
  async deleteAllRecordsByNamespace(indexName: string, namespace: string) {
    const pineconeIndex = this.pc.Index(indexName);
    await pineconeIndex.namespace(namespace).deleteAll();
  }
}
