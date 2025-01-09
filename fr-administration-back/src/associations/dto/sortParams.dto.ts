import { IsIn, IsOptional, IsString } from 'class-validator';

export default class SortParamsDto {
  @IsString()
  @IsOptional()
  @IsIn(['content', 'date', 'association', 'voters'])
  sort: 'content' | 'date' | 'association' | 'voters';
  @IsString()
  @IsOptional()
  @IsIn(['DESC', 'ASC', 'desc', 'asc'])
  order: 'DESC' | 'ASC' | 'desc' | 'asc';
}
