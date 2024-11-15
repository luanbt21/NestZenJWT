import { Prisma, PrismaClient } from "@prisma/client";

export type CustomPrismaClient = ReturnType<typeof customPrismaClient>;
import { drizzle } from "drizzle-orm/prisma/pg";

export const customPrismaClient = (prismaClient: PrismaClient) => {
	return prismaClient.$extends(drizzle());
};

export class PrismaClientExtended extends PrismaClient<
	Prisma.PrismaClientOptions,
	"query"
> {
	private customClient: CustomPrismaClient;

	get $drizzle() {
		if (!this.customClient) this.customClient = customPrismaClient(this);
		return this.customClient.$drizzle;
	}
}
