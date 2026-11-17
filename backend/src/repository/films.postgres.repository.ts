import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { SeatDto } from '../common/dto/seat.dto';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';
import { FilmsRepository } from './films.repository';
import { toFilmDto, toScheduleDto, toSeatKey } from './films.mapper';

const areUuids = (...ids: string[]): boolean => ids.every((id) => isUUID(id));

@Injectable()
export class FilmsPostgresRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film) private readonly filmRepository: Repository<Film>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find();
    return films.map(toFilmDto);
  }

  async findSchedule(filmId: string): Promise<ScheduleDto[] | null> {
    if (!areUuids(filmId)) {
      return null;
    }
    const film = await this.filmRepository.findOne({
      where: { id: filmId },
      relations: { schedule: true },
      order: { schedule: { daytime: 'ASC' } },
    });
    return film ? film.schedule.map(toScheduleDto) : null;
  }

  async takeSeats(
    filmId: string,
    sessionId: string,
    seats: SeatDto[],
  ): Promise<boolean> {
    const keys = seats.map(toSeatKey);
    return this.dataSource.transaction(async (manager) => {
      const session = await this.lockSession(manager, filmId, sessionId);
      if (!session || keys.some((key) => session.taken.includes(key))) {
        return false;
      }
      await manager.update(
        Schedule,
        { id: session.id },
        { taken: [...session.taken, ...keys] },
      );
      return true;
    });
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    seats: SeatDto[],
  ): Promise<void> {
    const released = new Set(seats.map(toSeatKey));
    await this.dataSource.transaction(async (manager) => {
      const session = await this.lockSession(manager, filmId, sessionId);
      if (!session) {
        return;
      }
      await manager.update(
        Schedule,
        { id: session.id },
        { taken: session.taken.filter((key) => !released.has(key)) },
      );
    });
  }

  private async lockSession(
    manager: EntityManager,
    filmId: string,
    sessionId: string,
  ): Promise<Schedule | null> {
    if (!areUuids(filmId, sessionId)) {
      return null;
    }
    return manager.findOne(Schedule, {
      where: { id: sessionId, filmId },
      lock: { mode: 'pessimistic_write' },
    });
  }
}
