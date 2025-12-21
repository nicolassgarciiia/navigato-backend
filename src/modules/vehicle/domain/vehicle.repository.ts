import { Vehicle } from "./vehicle.entity";

export abstract class VehicleRepository {
  abstract save(vehicle: Vehicle, userId: string): Promise<void>;
  abstract findByUser(userId: string): Promise<Vehicle[]>;
  abstract findByIdAndUser(vehicleId: string, userId: string): Promise<Vehicle | null>;
  abstract delete(vehicleId: string): Promise<void>;
  abstract updateVehicle(vehicleId: string, consumo: number): Promise<void>;
  abstract setFavorite(vehicleId: string, favorito: boolean): Promise<void>;
}
