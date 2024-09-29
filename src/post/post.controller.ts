import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostService } from "./post.service";

@Controller("posts")
@ApiBearerAuth()
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get()
	async getAllPosts() {
		return this.postService.getAllPosts();
	}

	@Post()
	async createDraft(@Body() data: CreatePostDto) {
		return this.postService.createDraft(data);
	}

	@Put("publish/:id")
	async publishPost(@Param("id") id: string) {
		return this.postService.publishPost(id);
	}
}
