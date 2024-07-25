import { Injectable } from '@nestjs/common';
import { CreatePineconeDto } from './dto/create-pinecone.dto';
import { UpdatePineconeDto } from './dto/update-pinecone.dto';

@Injectable()
export class PineconeService {
  create(createPineconeDto: CreatePineconeDto) {
    return 'This action adds a new pinecone';
  }

  findAll() {
    return `This action returns all pinecone`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pinecone`;
  }

  update(id: number, updatePineconeDto: UpdatePineconeDto) {
    return `This action updates a #${id} pinecone`;
  }

  remove(id: number) {
    return `This action removes a #${id} pinecone`;
  }
}
