import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  consumo?: number;
}
