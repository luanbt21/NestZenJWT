export class BackupFile {
	id: string;
	dbName: string;
	fileName: string;
	path: string;
	size: string;
	createdAt: string;
}

export class GetBackupRequest {
	offset?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
}

export class FindByIdRequest {
	id: string;
}

export class Status {
	message: string;
}

export class GetBackupResponse {
	files: BackupFile[];
	total: number;
}

export class DumpRequest {
	username: string;
	password: string;
	host: string;
	port: string;
	dbName: string;
}
