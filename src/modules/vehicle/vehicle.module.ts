import { Module } from "@nestjs/common";
import { VehicleController } from "./vehicle.controller";
import { VehicleService } from "./application/vehicle.service";
import { VehicleRepository } from "./domain/vehicle.repository";
import { SupabaseVehicleRepository } from "./infrastructure/supabase-vehicle.repository";
import { UserRepository } from "../user/domain/user.repository";
import { SupabaseUserRepository } from "../user/infrastructure/supabase-user.repository";

@Module({
  controllers: [VehicleController],
  providers: [
    VehicleService,
    {
      provide: VehicleRepository,
      useClass: SupabaseVehicleRepository,
    },
    {
      provide: UserRepository,
      useClass: SupabaseUserRepository,
    },
  ],
  exports: [VehicleRepository]
})
export class VehicleModule {}
