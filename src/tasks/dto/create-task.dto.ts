import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  IsNumber,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({
    description: "Título da tarefa",
    example: "Implementar autenticação",
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "Descrição detalhada da tarefa",
    example: "Criar sistema de login e autorização com JWT",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Status atual da tarefa",
    example: "todo",
    enum: ["todo", "in_progress", "review", "done"],
    default: "todo",
  })
  @IsOptional()
  @IsIn(["todo", "in_progress", "review", "done"], {
    message: "Status deve ser um dos valores permitidos",
  })
  status?: "todo" | "in_progress" | "review" | "done";

  @ApiProperty({
    description: "Prioridade da tarefa",
    example: "high",
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  })
  @IsOptional()
  @IsIn(["low", "medium", "high", "critical"], {
    message: "Prioridade deve ser um dos valores permitidos",
  })
  priority?: "low" | "medium" | "high" | "critical";

  @ApiProperty({
    description: "Data de vencimento da tarefa",
    example: "2024-01-25T00:00:00.000Z",
    format: "date-time",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: "ID do projeto ao qual a tarefa pertence",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: "ID do usuário responsável pela tarefa",
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  assigneeId: number;
}
