import { Module } from "@nestjs/common";
import { enhance } from "@zenstackhq/runtime";
import { ZenStackModule } from "@zenstackhq/server/nestjs";
import { AppController } from "./app.controller";
import { PostModule } from "./post/post.module";
import { PrismaService } from "./prisma.service";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		ZenStackModule.registerAsync({
			useFactory: (prisma: PrismaService) => {
				return {
					getEnhancedPrisma: () => enhance(prisma, { user: { id: "1" } }),
				};
			},
			inject: [PrismaService],
			extraProviders: [PrismaService],
			global: true,
		}),
		UserModule,
		PostModule,
	],
	controllers: [AppController],
	providers: [PrismaService],
})
export class AppModule {}
