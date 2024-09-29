import { Inject, Injectable } from "@nestjs/common";
import { ENHANCED_PRISMA } from "@zenstackhq/server/nestjs";
import type { PrismaService } from "src/prisma.service";
import type { CreatePostDto } from "./dto/create-post.dto";

@Injectable()
export class PostService {
	constructor(
		@Inject(ENHANCED_PRISMA) private readonly prismaService: PrismaService,
	) {}

	async getAllPosts() {
		return this.prismaService.post.findMany();
	}

	async createDraft(data: CreatePostDto) {
		return this.prismaService.post.create({ data });
	}

	async publishPost(id: string) {
		this.prismaService.post.findMany({});
		return this.prismaService.post.update({
			where: { id },
			data: { published: true },
		});
	}
}
