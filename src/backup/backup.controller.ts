import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	Res,
} from "@nestjs/common";
import { BackupService } from "./backup.service";
import type { Response } from "express";
import {
	BackupFile,
	FindByIdRequest,
	GetBackupRequest,
	GetBackupResponse,
	Status,
} from "./dto/backup.dto";
import { Observable } from "rxjs";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("backup")
@ApiBearerAuth()
export class BackupController {
	constructor(private readonly backupService: BackupService) {}

	@Get()
	findAll(
		@Query() getBackupRequest: GetBackupRequest,
	): Observable<GetBackupResponse> {
		return this.backupService.findAll(getBackupRequest);
	}

	@Get("/:id/file")
	async downloadFile(@Param("id") id: string, @Res() res: Response) {
		const { path, fileName } = await this.backupService.download(id);
		res.download(path, fileName);
	}

	@Post("dump")
	dump(): Observable<BackupFile> {
		return this.backupService.dump();
	}

	@Post("restore")
	restore(@Body() { id }: FindByIdRequest): Promise<Observable<Status>> {
		return this.backupService.restore({ id });
	}

	@Delete("/:id")
	delete(@Param("id") id: string): Promise<Observable<Status>> {
		return this.backupService.delete(id);
	}
}
