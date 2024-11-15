import {
	Body,
	Controller,
	Get,
	Headers,
	Post,
	Query,
	Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "../decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SignupDto } from "./dto/signup.dto";
import { RegisterDeviceDto } from "./dto/register-device.dto";
import { LogoutDto } from "./dto/logout.dto";
import type { Request } from "express";
import { MessageDto } from "./dto/message.dto";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post("signup")
	register(
		@Body() signupDto: SignupDto,
		@Headers() headers: Record<string, string>,
	) {
		return this.authService.signup(signupDto, headers);
	}

	@Public()
	@Post("login")
	login(
		@Body() { email, password }: LoginDto,
		@Headers() headers: Record<string, string>,
	) {
		return this.authService.login(email, password, headers);
	}

	@Public()
	@Post("refresh-token")
	refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
		return this.authService.refreshToken(refreshTokenDto);
	}

	// TODO: implement biometric login
	@Post("register-device-key")
	registerDevice(@Body() registerDeviceDto: RegisterDeviceDto) {}

	@Public()
	@Get("challenge")
	getChallenge(@Query("deviceId") deviceId: string) {
		return this.authService.getChallenge(deviceId);
	}

	@ApiBearerAuth()
	@Post("logout")
	async logout(
		@Body() { refreshToken }: LogoutDto,
		@Req() req: Request,
	): Promise<MessageDto> {
		const token = req.headers.authorization.split(" ")[1];
		await this.authService.logout(token, refreshToken);
		return { message: "Logged out successfully" };
	}

	@ApiBearerAuth()
	@Post("logout-all")
	async logoutAll(@Body() userIdDto: { userId: string }): Promise<MessageDto> {
		const { userId } = userIdDto;
		await this.authService.revokeAllTokensForUser(userId);
		return { message: "Logged out from all devices successfully" };
	}
}
