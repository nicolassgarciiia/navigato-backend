import { IsIn, IsObject, IsString } from "class-validator";

export class CalculateRouteByTypeDto {
  @IsObject()
  origen: {
    lat: number;
    lng: number;
  };

  @IsObject()
  destino: {
    lat: number;
    lng: number;
  };

  @IsString()
  metodo: string;

  @IsIn(["rapida", "corta", "economica"])
  tipo: "rapida" | "corta" | "economica";
}
