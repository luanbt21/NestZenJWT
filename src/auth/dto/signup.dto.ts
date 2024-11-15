import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class SignupDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	name: string;

	@ApiProperty({ enum: UserRole })
	@IsEnum(UserRole)
	role: UserRole;

	@IsString()
	@IsNotEmpty()
	// @MinLength(6)
	password: string;
}
