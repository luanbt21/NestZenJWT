import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "../decorator";
import { auth } from "@zenstackhq/runtime";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.getAllAndOverride(Roles, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!roles) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user = request.user as auth.User;

		console.log(111, roles, user.role);

		return roles.includes(user.role);
	}
}
