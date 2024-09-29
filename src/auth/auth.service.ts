import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { auth } from "@zenstackhq/runtime";
import { compare, hash } from "bcrypt";
import { PrismaService } from "../prisma.service";
import { AuthEntity } from "./entity/auth.entity";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
	) {}

	async signup(email: string, password: string): Promise<AuthEntity> {
		const hashedPassword = await hash(password, 10);
		const user = await this.prisma.user.create({
			data: { email, password: hashedPassword },
		});

		return {
			accessToken: this.jwtService.sign({ userId: user.id }),
		};
	}

	async login(email: string, password: string): Promise<AuthEntity> {
		const user = await this.prisma.user.findUnique({ where: { email: email } });

		if (!user) {
			throw new NotFoundException(`No user found for email: ${email}`);
		}

		const isPasswordValid = await compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid password");
		}

		return {
			accessToken: this.jwtService.sign({ userId: user.id }),
		};
	}

	async validate(payload: { userId: string }) {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.userId },
			select: { id: true, email: true },
		});

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}

	async verifyAsync(token: string) {
		return this.jwtService.verify(token);
	}

	async basicValidate(email: string, password: string): Promise<auth.User> {
		const user = await this.prisma.user.findUnique({ where: { email: email } });

		if (!user) {
			throw new NotFoundException(`No user found for email: ${email}`);
		}

		const isPasswordValid = await compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid password");
		}

		return { id: user.id, email: user.email };
	}
}
