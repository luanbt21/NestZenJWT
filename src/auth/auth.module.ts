import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaService } from "../prisma.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "secretKey",
			signOptions: { expiresIn: "60m" },
		}),
	],
	exports: [AuthService],
	providers: [AuthService, JwtStrategy, PrismaService],
	controllers: [AuthController],
})
export class AuthModule {}
