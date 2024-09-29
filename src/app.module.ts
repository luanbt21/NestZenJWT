import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD, REQUEST } from "@nestjs/core";
import { enhance } from "@zenstackhq/runtime";
import { ZenStackModule } from "@zenstackhq/server/nestjs";
import { Request } from "express";

import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { PostModule } from "./post/post.module";
import { PrismaService } from "./prisma.service";
import { UserModule } from "./user/user.module";
import { CrudMiddleware } from "./zen/crud.middleware";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ZenStackModule.registerAsync({
			useFactory: (request: Request, prisma: PrismaService) => {
				return {
					getEnhancedPrisma: () =>
						enhance(prisma, { user: request.user }, { logPrismaQuery: true }),
				};
			},
			inject: [REQUEST, PrismaService],
			extraProviders: [PrismaService],
			global: true,
		}),
		UserModule,
		PostModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [
		PrismaService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
// export class AppModule {}
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CrudMiddleware).forRoutes("/models");
	}
}
