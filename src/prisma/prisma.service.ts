import { Injectable, type OnModuleInit } from "@nestjs/common";
import { PrismaClientExtended } from "./extends";

@Injectable()
export class PrismaService
	extends PrismaClientExtended
	implements OnModuleInit
{
	constructor() {
		super({
			log: [
				{
					emit: "event",
					level: "query",
				},
				{
					emit: "stdout",
					level: "error",
				},
				{
					emit: "stdout",
					level: "info",
				},
				{
					emit: "stdout",
					level: "warn",
				},
			],
		});
	}

	async onModuleInit() {
		this.$on("query", (e) => {
			console.log(`Query: ${e.query}`);
			console.log(`Params: ${e.params}`);
		});
		await this.$connect();
	}
}
