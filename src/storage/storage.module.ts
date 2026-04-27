import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageAdapter } from 'src/adapters/storage/storage.adapter';
import { MinionAdapter } from 'src/adapters/storage/minion.adapter';
import { StorageController } from './storage.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    StorageService,
    {
      provide: StorageAdapter,
      useClass: MinionAdapter,
    },
  ],
  controllers: [StorageController],
  exports: [StorageAdapter],
})
export class StorageModule {}
