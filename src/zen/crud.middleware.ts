import { Injectable, NestMiddleware } from "@nestjs/common";
import { auth, enhance } from "@zenstackhq/runtime";
import RESTHandler from "@zenstackhq/server/api/rest";
import { ZenStackMiddleware } from "@zenstackhq/server/express";

import { Request, Response } from "express";

import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "../prisma.service";

@Injectable()
export class CrudMiddleware implements NestMiddleware {
	constructor(
		private readonly authService: AuthService,
		private readonly prismaService: PrismaService,
	) {}

	async use(req: Request, _res: Response, next: (error?) => void) {
		const [type, token] = req.headers.authorization?.split(" ") ?? [];
		let user: auth.User | null = null;
		if (type === "Bearer" && token) {
			const payload = await this.authService.verifyAsync(token);
			user = await this.authService.validate(payload);
		}

		// development mode only, remove in production
		if (type === "Basic" && token) {
			const [email, password] =
				Buffer.from(token, "base64").toString().split(":") ?? [];
			if (!email || !password) {
				throw new Error("Invalid token");
			}
			user = await this.authService.basicValidate(email, password);
		}

		const inner = ZenStackMiddleware({
			getPrisma: () =>
				enhance(this.prismaService, { user }, { logPrismaQuery: true }),
			handler: RESTHandler({
				endpoint: `${req.protocol}://${req.headers.host}${req.baseUrl}`,
			}),
		});
		inner(req, _res, next);
	}
}
