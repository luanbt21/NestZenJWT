import { Inject, Injectable } from "@nestjs/common";
import { ENHANCED_PRISMA } from "@zenstackhq/server/nestjs";
import type { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
	constructor(
		@Inject(ENHANCED_PRISMA) private readonly prismaService: PrismaService,
	) {}

	getAllUsers() {
		return this.prismaService.user.findMany();
	}
}
