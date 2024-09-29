import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();
// const enhancePrisma = enhance(prisma, { user: { id: "1" } });

async function main() {
	await prisma.post.deleteMany();
	await prisma.user.deleteMany();

	await prisma.user.create({
		data: {
			email: "admin@example.com",
			password: await hash("1", 10),
			posts: {
				createMany: {
					data: [
						{
							title: "Post 1",
							content: "Content 1",
						},
						{
							title: "Post 2",
							content: "Content 2",
						},
					],
				},
			},
		},
	});

	await prisma.user.create({
		data: {
			email: "user1@example.com",
			password: await hash("1", 10),
			posts: {
				createMany: {
					data: [
						{
							title: "Post 3",
							content: "Content 3",
						},
						{
							title: "Post 4",
							content: "Content 4",
						},
					],
				},
			},
		},
	});
}

main();
