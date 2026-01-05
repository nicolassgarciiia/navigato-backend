import { IsString } from "class-validator";

export class CalculateRouteCostDto {
  @IsString()
  vehiculo: string;
}
