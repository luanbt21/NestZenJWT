import { Module } from "@nestjs/common";
import { BackupService } from "./backup.service";
import { BackupController } from "./backup.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { BACKUP_PACKAGE_NAME, BACKUP_SERVICE_NAME } from "../grpc/proto/backup";

@Module({
	imports: [
		ClientsModule.register([
			{
				name: BACKUP_SERVICE_NAME,
				transport: Transport.GRPC,
				options: {
					url: process.env.UTILS_SERVICE_URL,
					package: BACKUP_PACKAGE_NAME,
					protoPath: ["./proto/backup.proto"],
				},
			},
		]),
	],
	controllers: [BackupController],
	providers: [BackupService],
	exports: [BackupService],
})
export class BackupModule {}
