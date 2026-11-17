import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfig, CONFIG } from '../app.config.provider';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FILMS_REPOSITORY } from './films.repository';
import { FilmsPostgresRepository } from './films.postgres.repository';

const filmsRepositoryProvider = {
  provide: FILMS_REPOSITORY,
  useClass: FilmsPostgresRepository,
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [CONFIG],
      useFactory: (config: AppConfig): TypeOrmModuleOptions => {
        const { driver, url, username, password } = config.database;
        if (driver !== 'postgres') {
          throw new Error(`Неподдерживаемый DATABASE_DRIVER: ${driver}`);
        }
        const connectionUrl = new URL(url);
        connectionUrl.username = encodeURIComponent(username);
        connectionUrl.password = encodeURIComponent(password);
        return {
          type: 'postgres',
          url: connectionUrl.toString(),
          entities: [Film, Schedule],
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  providers: [filmsRepositoryProvider],
  exports: [filmsRepositoryProvider],
})
export class RepositoryModule {}
