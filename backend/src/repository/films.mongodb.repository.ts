import { Inject, Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { SeatDto } from '../common/dto/seat.dto';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { DATABASE_CONNECTION } from './database.provider';
import { FilmsRepository } from './films.repository';
import { toFilmDto, toScheduleDto, toSeatKey } from './films.mapper';
import { FilmEntity, FilmSchema } from './schemas/film.schema';

@Injectable()
export class FilmsMongoDbRepository implements FilmsRepository {
  private readonly filmModel: Model<FilmEntity>;

  constructor(@Inject(DATABASE_CONNECTION) connection: Connection) {
    this.filmModel = connection.model<FilmEntity>('Film', FilmSchema, 'films');
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmModel.find().lean<FilmEntity[]>();
    return films.map(toFilmDto);
  }

  async findSchedule(filmId: string): Promise<ScheduleDto[] | null> {
    const film = await this.filmModel
      .findOne({ id: filmId }, 'schedule')
      .lean<Pick<FilmEntity, 'schedule'> | null>();
    return film ? film.schedule.map(toScheduleDto) : null;
  }

  async takeSeats(
    filmId: string,
    sessionId: string,
    seats: SeatDto[],
  ): Promise<boolean> {
    const keys = seats.map(toSeatKey);
    const result = await this.filmModel.updateOne(
      {
        id: filmId,
        schedule: { $elemMatch: { id: sessionId, taken: { $nin: keys } } },
      },
      { $addToSet: { 'schedule.$.taken': { $each: keys } } },
    );
    return result.modifiedCount === 1;
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: SeatDto[],
  ): Promise<void> {
    await this.filmModel.updateOne(
      { id: filmId, 'schedule.id': sessionId },
      { $pull: { 'schedule.$.taken': { $in: seats.map(toSeatKey) } } },
    );
  }
}
