import {
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorator";
import { AuthService } from "./auth.service";
import type { Request } from "express";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(
		private reflector: Reflector,
		private readonly authService: AuthService,
	) {
		super();
	}

	async canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		if (request.path === "/api/metrics") {
			return true;
		}

		const token = request.headers.authorization?.split(" ")[1];
		if (!token || !(await this.authService.isActiveToken(token))) {
			return false;
		}

		return super.canActivate(context) as boolean;
	}

	handleRequest(err: Error, user, info) {
		if (err || !user) {
			console.log(err, user, info);
			throw err || new UnauthorizedException();
		}
		return user;
	}
}
