import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PineconeService } from './pinecone.service';
import { CreatePineconeDto } from './dto/create-pinecone.dto';
import { UpdatePineconeDto } from './dto/update-pinecone.dto';

@Controller('pinecone')
export class PineconeController {
  constructor(private readonly pineconeService: PineconeService) {}

  @Post()
  create(@Body() createPineconeDto: CreatePineconeDto) {
    return this.pineconeService.create(createPineconeDto);
  }

  @Get()
  findAll() {
    return this.pineconeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pineconeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePineconeDto: UpdatePineconeDto) {
    return this.pineconeService.update(+id, updatePineconeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pineconeService.remove(+id);
  }
}
