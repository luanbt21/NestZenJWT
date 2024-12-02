import {
	Catch,
	ExceptionFilter,
	ArgumentsHost,
	HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Response, Request } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionsFilter implements ExceptionFilter {
	catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();
		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		if (error.code === "P2025") status = HttpStatus.NOT_FOUND;
		if (error.code === "P2002") status = HttpStatus.CONFLICT;
		if (error.code === "P2003") status = HttpStatus.BAD_REQUEST;

		response.status(status).json({
			errorCode: error.code,
			timestamp: new Date().toISOString(),
			path: request.url,
			message: error.message,
		});
	}
}
