import { PartialType } from '@nestjs/mapped-types';
import { CreatePineconeDto } from './create-pinecone.dto';

export class UpdatePineconeDto extends PartialType(CreatePineconeDto) {}
