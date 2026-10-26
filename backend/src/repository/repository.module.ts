import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { Connection } from 'mongoose';
import { DATABASE_CONNECTION, databaseProvider } from './database.provider';
import { FILMS_REPOSITORY } from './films.repository';
import { FilmsMongoDbRepository } from './films.mongodb.repository';

const filmsRepositoryProvider = {
  provide: FILMS_REPOSITORY,
  useClass: FilmsMongoDbRepository,
};

@Module({
  providers: [databaseProvider, filmsRepositoryProvider],
  exports: [filmsRepositoryProvider],
})
export class RepositoryModule implements OnModuleDestroy {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.connection.close();
  }
}
