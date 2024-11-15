import { RedisService } from "@liaoliaots/nestjs-redis";
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { auth } from "@zenstackhq/runtime";
import { compare, hash } from "bcrypt";
import ms from "ms";
import { UAParser } from "ua-parser-js";
import { PrismaService } from "../prisma/prisma.service";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SignupDto } from "./dto/signup.dto";
import { AuthEntity } from "./entity/auth.entity";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private readonly redisService: RedisService,
	) {}

	async signup(
		signupDto: SignupDto,
		headers: Record<string, string>,
	): Promise<AuthEntity> {
		const { password, ...rest } = signupDto;
		const hashedPassword = await hash(password, 12);
		const user = await this.prisma.user.create({
			data: { ...rest, password: hashedPassword },
		});

		const accessToken = await this.newAccessToken(user.id);
		const { refreshToken, deviceId } = await this.newRefreshToken({
			userId: user.id,
			iResult: await UAParser(headers).withClientHints(),
		});

		return { accessToken, refreshToken, deviceId };
	}

	async login(
		email: string,
		password: string,
		headers: Record<string, string>,
	): Promise<AuthEntity> {
		const user = await this.prisma.user.findUnique({
			where: { email: email, deleted: null },
		});
		this.checkUser(user);

		const isPasswordValid = await compare(password, user.password);
		if (!isPasswordValid) {
			await this.prisma.user.update({
				where: { id: user.id },
				data: { loginFailed: { increment: 1 } },
			});

			// TODO: Use the maximum failed login attempts value here
			if (user.loginFailed >= 3) {
				await this.prisma.user.update({
					where: { id: user.id },
					data: { locked: true },
				});

				this.revokeAllTokensForUser(user.id);
			}

			throw new UnauthorizedException("Invalid password");
		}

		if (user.loginFailed > 0) {
			await this.prisma.user.update({
				where: { id: user.id },
				data: { loginFailed: 0 },
			});
		}

		const accessToken = await this.newAccessToken(user.id);
		const { refreshToken, deviceId } = await this.newRefreshToken({
			userId: user.id,
			iResult: await UAParser(headers).withClientHints(),
		});

		return { accessToken, refreshToken, deviceId };
	}

	async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthEntity> {
		const { refreshToken, deviceId } = refreshTokenDto;

		const storedToken = await this.prisma.refreshToken.findUnique({
			where: { token: refreshToken },
			include: { user: { select: { locked: true } } },
		});

		if (
			!storedToken ||
			storedToken.revoked ||
			storedToken.expiresAt < new Date()
		) {
			throw new UnauthorizedException("Refresh token is invalid or expired");
		}

		if (storedToken.deviceId !== deviceId) {
			throw new UnauthorizedException("Invalid device");
		}

		this.checkUser(storedToken.user);

		const accessToken = await this.newAccessToken(storedToken.userId);

		// if refresh token expires in less than 3 days, create new one
		if (storedToken.expiresAt < new Date(Date.now() + 3 * 86400 * 1000)) {
			const { refreshToken: newRefreshToken, deviceId: newDeviceId } =
				await this.newRefreshToken({
					userId: storedToken.userId,
					deviceId,
				});
			return {
				accessToken,
				refreshToken: newRefreshToken,
				deviceId: newDeviceId,
			};
		}

		return { accessToken, refreshToken, deviceId };
	}

	async getChallenge(deviceId: string) {
		const device = await this.prisma.device.findUnique({
			where: { id: deviceId },
		});
		if (!device) {
			throw new NotFoundException("Device not found");
		}

		// return random string
		return Math.random().toString(36).slice(2);
	}

	async logout(token: string, refreshToken: string) {
		await this.prisma.refreshToken.update({
			where: { token: refreshToken },
			data: { revoked: true },
		});
		const userId = this.jwtService.decode(token)?.userId;
		await this.redisService
			.getOrNil()
			?.del(`active_session:${userId}:${token}`);
	}

	async revokeAllTokensForUser(userId: string) {
		await this.prisma.refreshToken.updateMany({
			where: { userId },
			data: { revoked: true },
		});

		let cursor = "0";
		const redis = this.redisService.getOrNil();
		if (!redis) return;
		const pattern = `${process.env.APP_NAME}:active_session:${userId}:*`;
		do {
			const [nextCursor, keys] = await redis.scan(
				cursor,
				"MATCH",
				pattern,
				"COUNT",
				100,
			);
			cursor = nextCursor;

			if (keys.length > 0) {
				await redis.del(...keys);
			}
		} while (cursor !== "0");
	}

	async validate(payload: { userId: string }) {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.userId, deleted: null },
			select: {
				id: true,
				email: true,
				role: true,
				locked: true,
				groups: {
					include: {
						permissions: true,
					},
				},
			},
		});

		this.checkUser(user);

		return user;
	}

	async verifyToken(token: string) {
		try {
			return this.jwtService.verify(token);
		} catch (error) {
			throw new UnauthorizedException();
		}
	}

	async isActiveToken(token: string) {
		const redis = this.redisService.getOrNil();
		if (!redis) return true;

		const userId = this.jwtService.decode(token)?.userId;
		if (!userId) return false;

		return redis.get(`active_session:${userId}:${token}`);
	}

	async countActiveUsers(): Promise<number> {
		const redis = this.redisService.getOrThrow();
		const activeUsers = new Set();
		let cursor = "0";
		const pattern = `${process.env.APP_NAME}:active_session:*`;
		do {
			const [nextCursor, keys] = await redis.scan(
				cursor,
				"MATCH",
				pattern,
				"COUNT",
				100,
			);
			cursor = nextCursor;

			if (keys.length > 0) {
				console.log(keys.length, keys);

				for (const key of keys) {
					const [, , userId] = key.split(":");
					activeUsers.add(userId);
				}
			}
		} while (cursor !== "0");

		return activeUsers.size;
	}

	async basicValidate(email: string, password: string): Promise<auth.User> {
		const user = await this.prisma.user.findUnique({
			where: { email: email, locked: false, deleted: null },
			select: {
				id: true,
				email: true,
				role: true,
				password: true,
				locked: true,
				groups: {
					include: {
						permissions: true,
					},
				},
			},
		});

		this.checkUser(user);

		const isPasswordValid = await compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid password");
		}

		return user;
	}

	private trackActiveSession(userId: string, token: string) {
		this.redisService
			.getOrNil()
			?.set(
				`active_session:${userId}:${token}`,
				"true",
				"EX",
				ms(process.env.JWT_EXPIRES_IN),
			);
	}

	private async newAccessToken(userId: string) {
		const accessToken = this.jwtService.sign({ userId });
		this.trackActiveSession(userId, accessToken);
		return accessToken;
	}

	private async newRefreshToken({
		userId,
		iResult,
		deviceId,
	}: {
		userId: string;
		iResult?: UAParser.IResult;
		deviceId?: string;
	}) {
		if (!iResult && !deviceId) {
			throw new UnauthorizedException("Invalid device");
		}

		const refreshToken = this.jwtService.sign(
			{ userId: userId },
			{
				secret: process.env.JWT_REFRESH_SECRET,
				expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
			},
		);

		if (iResult) {
			const { browser, os, device } = iResult;
			const deviceName = `${browser.name} ${os.name || ""} ${device.model || ""}`;
			const deviceStored = await this.prisma.device.findFirst({
				where: { userId, name: deviceName },
			});
			const oldRefreshToken = await this.prisma.refreshToken.findFirst({
				where: { userId, deviceId: deviceStored?.id },
			});
			const { deviceId } = await this.prisma.refreshToken.upsert({
				where: { id: oldRefreshToken?.id || "" },
				create: {
					user: { connect: { id: userId } },
					token: refreshToken,
					expiresAt: new Date(
						Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN),
					),
					device: {
						connectOrCreate: {
							where: { id: deviceStored?.id || "" },
							create: { userId: userId, name: deviceName },
						},
					},
				},
				update: {
					token: refreshToken,
					revoked: false,
					expiresAt: new Date(
						Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN),
					),
				},
				select: { deviceId: true },
			});

			return { refreshToken, deviceId };
		}

		if (deviceId) {
			await this.prisma.refreshToken.updateMany({
				where: { userId, deviceId },
				data: {
					token: refreshToken,
					revoked: false,
					expiresAt: new Date(
						Date.now() + ms(process.env.JWT_REFRESH_EXPIRES_IN),
					),
				},
			});
			return { refreshToken, deviceId };
		}
	}

	private checkUser(user: Pick<User, "locked">) {
		if (!user) {
			throw new NotFoundException("User not found");
		}

		if (user.locked) {
			throw new UnauthorizedException("User is locked");
		}
	}
}
