import { Vehicle } from "./vehicle.entity";

export abstract class VehicleRepository {
  abstract save(vehicle: Vehicle, userId: string): Promise<void>;
}
