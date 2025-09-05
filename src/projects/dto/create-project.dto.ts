import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsDateString,
  IsOptional,
  IsNumber,
  MinLength,
  IsArray,
  ValidateNested,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ProjectMemberInputDto } from "./project-member-input.dto";

export class CreateProjectDto {
  @ApiProperty({
    description: "Nome do projeto",
    example: "Sistema de Gestão de Projetos",
    minLength: 3,
  })
  @IsNotEmpty({ message: "Nome do projeto é obrigatório" })
  @IsString({ message: "Nome deve ser uma string" })
  @MinLength(3, { message: "Nome deve ter pelo menos 3 caracteres" })
  name: string;

  @ApiProperty({
    description: "Descrição do projeto",
    example: "Sistema completo para gestão de projetos e tarefas",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Descrição deve ser uma string" })
  description?: string;

  @ApiProperty({
    description: "Status do projeto",
    example: "planned",
    enum: ["planned", "active", "completed", "cancelled"],
    default: "planned",
  })
  @IsNotEmpty({ message: "Status é obrigatório" })
  @IsIn(["planned", "active", "completed", "cancelled"], {
    message: "Status deve ser um dos valores permitidos",
  })
  status: "planned" | "active" | "completed" | "cancelled";

  @ApiProperty({
    description: "Data de início do projeto",
    example: "2025-01-01",
    format: "date",
  })
  @IsNotEmpty({ message: "Data de início é obrigatória" })
  @IsDateString({}, { message: "Data de início deve ser uma data válida" })
  startDate: string;

  @ApiProperty({
    description: "Data de término do projeto",
    example: "2025-12-31",
    format: "date",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Data de término deve ser uma data válida" })
  endDate?: string;

  @ApiProperty({
    description: "ID do gerente do projeto",
    example: 1,
    type: "number",
  })
  @IsNotEmpty({ message: "ID do gerente é obrigatório" })
  @IsNumber({}, { message: "ID do gerente deve ser um número" })
  managerId: number;

  @ApiProperty({
    description: "Lista de membros a vincular na criação",
    required: false,
    type: [ProjectMemberInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectMemberInputDto)
  members?: ProjectMemberInputDto[];
}
