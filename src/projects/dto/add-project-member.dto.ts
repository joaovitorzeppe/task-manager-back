import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber } from "class-validator";

export class AddProjectMemberDto {
  @ApiProperty({ description: "ID do usuário a vincular", example: 3 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: "Papel do usuário no projeto",
    enum: ["viewer", "contributor", "maintainer"],
    example: "contributor",
  })
  @IsNotEmpty()
  @IsIn(["viewer", "contributor", "maintainer"])
  role: "viewer" | "contributor" | "maintainer";
}
