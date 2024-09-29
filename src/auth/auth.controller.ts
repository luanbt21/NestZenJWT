import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "src/decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("signup")
	register(@Body() { email, password }: SignupDto) {
		return this.authService.signup(email, password);
	}

	@Public()
	@Post("login")
	login(@Body() { email, password }: LoginDto) {
		return this.authService.login(email, password);
	}
}
