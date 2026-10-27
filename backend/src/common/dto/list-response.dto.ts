export class ListResponseDto<T> {
  total: number;
  items: T[];
}

export const toListResponse = <T>(items: T[]): ListResponseDto<T> => ({
  total: items.length,
  items,
});
