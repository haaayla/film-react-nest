import { IsInt, Min } from 'class-validator';

export class SeatDto {
  @IsInt()
  @Min(1)
  row: number;

  @IsInt()
  @Min(1)
  seat: number;
}
