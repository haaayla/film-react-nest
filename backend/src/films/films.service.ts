import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ListResponseDto,
  toListResponse,
} from '../common/dto/list-response.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY) private readonly filmsRepository: FilmsRepository,
  ) {}

  async findAll(): Promise<ListResponseDto<FilmDto>> {
    return toListResponse(await this.filmsRepository.findAll());
  }

  async findSchedule(filmId: string): Promise<ListResponseDto<ScheduleDto>> {
    const items = await this.filmsRepository.findSchedule(filmId);
    if (!items) {
      throw new NotFoundException(`Фильм с id ${filmId} не найден`);
    }
    return toListResponse(items);
  }
}
