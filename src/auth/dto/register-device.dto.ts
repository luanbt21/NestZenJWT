import { IsNotEmpty, IsString } from "class-validator";

export class RegisterDeviceDto {
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@IsString()
	@IsNotEmpty()
	publicKey: string;
}
