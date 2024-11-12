import {
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	OnModuleInit,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import {
	BackupClient,
	BACKUP_SERVICE_NAME,
	Provider,
	FindByIdRequest,
} from "../grpc/proto/backup";
import { GetBackupRequest } from "./dto/backup.dto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class BackupService implements OnModuleInit {
	private backupClient: BackupClient;

	constructor(@Inject(BACKUP_SERVICE_NAME) private client: ClientGrpc) {}

	async onModuleInit() {
		this.backupClient =
			this.client.getService<BackupClient>(BACKUP_SERVICE_NAME);
	}

	findAll(getBackupRequest: GetBackupRequest) {
		return this.backupClient.findAll({
			...getBackupRequest,
			dbName: process.env.DATABASE_NAME,
			provider: Provider.POSTGRES,
		});
	}

	async download(id: string) {
		const data = await firstValueFrom(this.backupClient.findById({ id }));
		if (!data) {
			throw new HttpException("not found", HttpStatus.NOT_FOUND);
		}
		const { path, fileName } = data;
		return { path, fileName };
	}

	dump() {
		return this.backupClient.dump({
			provider: Provider.POSTGRES,
			url: process.env.DATABASE_URL,
		});
	}

	dumpDBChangeLog() {
		return this.backupClient.dump({
			provider: Provider.MONGODB,
			url: process.env.MONGODB_URL,
		});
	}

	async restore({ id }: FindByIdRequest) {
		return this.backupClient.restore({
			provider: Provider.POSTGRES,
			url: process.env.DATABASE_URL,
			id,
		});
	}

	async delete(id: string) {
		return this.backupClient.delete({ id });
	}
}
