import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaService } from "../prisma/prisma.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "secretKey",
			signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
		}),
	],
	exports: [AuthService],
	providers: [AuthService, JwtStrategy, PrismaService],
	controllers: [AuthController],
})
export class AuthModule {}
