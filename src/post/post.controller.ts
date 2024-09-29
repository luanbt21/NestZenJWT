import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { PostService } from "./post.service";

@Controller("post")
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Get("posts")
	async getAllPosts() {
		return this.postService.getAllPosts();
	}

	@Post("posts")
	async createDraft(@Body() data: CreatePostDto) {
		return this.postService.createDraft(data);
	}

	@Put("posts/publish/:id")
	async publishPost(@Param("id") id: string) {
		return this.postService.publishPost(id);
	}
}
