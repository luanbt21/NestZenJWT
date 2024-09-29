import { Controller, Get, Inject, Param } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
	constructor(@Inject(UserService) private readonly userService: UserService) {}

	@Get("users")
	async getAllUsers() {
		console.log("getAllUsers");
		return this.userService.getAllUsers();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.userService.findOne(id);
	}
}
