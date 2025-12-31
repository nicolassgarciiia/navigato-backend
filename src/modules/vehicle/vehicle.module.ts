import { Module } from "@nestjs/common";
import { VehicleController } from "./vehicle.controller";
import { VehicleService } from "./application/vehicle.service";
import { VehicleRepository } from "./domain/vehicle.repository";
import { SupabaseVehicleRepository } from "./infrastructure/supabase-vehicle.repository";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    UserModule, 
  ],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    {
      provide: VehicleRepository,
      useClass: SupabaseVehicleRepository,
    },
  ],
  exports: [
    VehicleRepository, 
    VehicleService,
  ],
})
export class VehicleModule {}
