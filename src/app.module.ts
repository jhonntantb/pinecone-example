import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PineconeModule } from './pinecone/pinecone.module';

@Module({
  imports: [PineconeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
