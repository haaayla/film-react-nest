import { SeatDto } from '../common/dto/seat.dto';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export const FILMS_REPOSITORY = 'FILMS_REPOSITORY';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  findSchedule(filmId: string): Promise<ScheduleDto[] | null>;
  takeSeats(
    filmId: string,
    sessionId: string,
    seats: SeatDto[],
  ): Promise<boolean>;
  releaseSeats(
    filmId: string,
    sessionId: string,
    seats: SeatDto[],
  ): Promise<void>;
}
