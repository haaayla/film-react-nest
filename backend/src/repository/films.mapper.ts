import { SeatDto } from '../common/dto/seat.dto';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { FilmEntity, ScheduleEntity } from './schemas/film.schema';

export const toSeatKey = ({ row, seat }: SeatDto): string => `${row}:${seat}`;

export const toScheduleDto = (session: ScheduleEntity): ScheduleDto => ({
  id: session.id,
  daytime: session.daytime,
  hall: session.hall,
  rows: session.rows,
  seats: session.seats,
  price: session.price,
  taken: [...session.taken],
});

export const toFilmDto = (film: FilmEntity): FilmDto => ({
  id: film.id,
  rating: film.rating,
  director: film.director,
  tags: [...film.tags],
  title: film.title,
  about: film.about,
  description: film.description,
  image: film.image,
  cover: film.cover,
});
