import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ListResponseDto,
  toListResponse,
} from '../common/dto/list-response.dto';
import { SeatDto } from '../common/dto/seat.dto';
import { ScheduleDto } from '../films/dto/films.dto';
import {
  FILMS_REPOSITORY,
  FilmsRepository,
} from '../repository/films.repository';
import { OrderDto, OrderResultDto, TicketDto } from './dto/order.dto';

interface SessionTickets {
  filmId: string;
  sessionId: string;
  tickets: TicketDto[];
}

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY) private readonly filmsRepository: FilmsRepository,
  ) {}

  async create(order: OrderDto): Promise<ListResponseDto<OrderResultDto>> {
    const groups = this.groupBySession(order.tickets);
    for (const group of groups) {
      this.ensureNoDuplicates(group);
      const session = await this.findSession(group);
      this.ensureSeatsInHall(session, group.tickets);
    }
    await this.takeSeats(groups);

    return toListResponse(
      order.tickets.map((ticket) => ({ ...ticket, id: randomUUID() })),
    );
  }

  private groupBySession(tickets: TicketDto[]): SessionTickets[] {
    const groups = new Map<string, SessionTickets>();
    for (const ticket of tickets) {
      const key = JSON.stringify([ticket.film, ticket.session]);
      const group = groups.get(key) ?? {
        filmId: ticket.film,
        sessionId: ticket.session,
        tickets: [],
      };
      group.tickets.push(ticket);
      groups.set(key, group);
    }
    return [...groups.values()];
  }

  private ensureNoDuplicates({ tickets }: SessionTickets): void {
    const duplicate = tickets.find(
      (ticket, index) =>
        tickets.findIndex(
          ({ row, seat }) => row === ticket.row && seat === ticket.seat,
        ) !== index,
    );
    if (duplicate) {
      throw new BadRequestException(
        `Место ${duplicate.seat} в ряду ${duplicate.row} указано в заказе дважды`,
      );
    }
  }

  private async findSession({
    filmId,
    sessionId,
  }: SessionTickets): Promise<ScheduleDto> {
    const schedule = await this.filmsRepository.findSchedule(filmId);
    if (!schedule) {
      throw new BadRequestException(`Фильм с id ${filmId} не найден`);
    }
    const session = schedule.find((item) => item.id === sessionId);
    if (!session) {
      throw new BadRequestException(`Сеанс с id ${sessionId} не найден`);
    }
    return session;
  }

  private ensureSeatsInHall(session: ScheduleDto, seats: SeatDto[]): void {
    const outOfHall = seats.find(
      ({ row, seat }) => row > session.rows || seat > session.seats,
    );
    if (outOfHall) {
      throw new BadRequestException(
        `Места ${outOfHall.seat} в ряду ${outOfHall.row} нет в зале`,
      );
    }
  }

  private async takeSeats(groups: SessionTickets[]): Promise<void> {
    const taken: SessionTickets[] = [];
    try {
      for (const group of groups) {
        const isTaken = await this.filmsRepository.takeSeats(
          group.filmId,
          group.sessionId,
          group.tickets,
        );
        if (!isTaken) {
          throw new BadRequestException('Выбранные места уже заняты');
        }
        taken.push(group);
      }
    } catch (error) {
      for (const group of taken) {
        await this.filmsRepository.releaseSeats(
          group.filmId,
          group.sessionId,
          group.tickets,
        );
      }
      throw error;
    }
  }
}
