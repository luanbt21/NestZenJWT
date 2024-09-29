import { Inject, Injectable } from "@nestjs/common";
import { ENHANCED_PRISMA } from "@zenstackhq/server/nestjs";
import type { PrismaService } from "src/prisma.service";

@Injectable()
export class UserService {
	constructor(
		@Inject(ENHANCED_PRISMA) private readonly prismaService: PrismaService,
	) {}

	getAllUsers() {
		return this.prismaService.user.findMany();
	}

	findOne(id: string) {
		return this.prismaService.user.findFirst({ where: { id } });
	}
}
