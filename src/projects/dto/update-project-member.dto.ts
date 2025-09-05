import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateProjectMemberDto {
  @ApiProperty({
    description: "Novo papel do usuário no projeto",
    enum: ["viewer", "contributor", "maintainer"],
    example: "maintainer",
  })
  @IsNotEmpty()
  @IsIn(["viewer", "contributor", "maintainer"])
  role: "viewer" | "contributor" | "maintainer";
}
