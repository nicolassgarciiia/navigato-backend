export class UpdateVehicleDto {
  nombre?: string;
  matricula?: string;
  tipo?: "COMBUSTION" | "ELECTRICO";
  consumo?: number;
  favorito?: boolean;
}
