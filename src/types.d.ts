import { auth } from "@zenstackhq/runtime";

declare module "express" {
	export interface Request {
		user?: auth.User; // The `user` property is optional
	}
}
