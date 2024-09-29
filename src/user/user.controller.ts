import { Controller, Get, Inject } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
	constructor(@Inject(UserService) private readonly userService: UserService) {}

	@Get("users")
	async getAllUsers() {
		return this.userService.getAllUsers();
	}
}
