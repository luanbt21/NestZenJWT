import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	// @MinLength(6)
	password: string;
}
