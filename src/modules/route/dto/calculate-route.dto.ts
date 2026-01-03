import { IsObject, IsString } from "class-validator";

export class CalculateRouteDto {
  @IsObject()
  origen: { lat: number; lng: number };

  @IsObject()
  destino: { lat: number; lng: number };

  @IsString()
  metodo: string;
}
