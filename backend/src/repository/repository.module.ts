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
        const { driver, host, port, name, username, password } =
          config.database;
        if (driver !== 'postgres') {
          throw new Error(`Неподдерживаемый DATABASE_DRIVER: ${driver}`);
        }
        return {
          type: 'postgres',
          host,
          port,
          database: name,
          username,
          password,
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
