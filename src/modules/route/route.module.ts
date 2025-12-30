import { Module } from "@nestjs/common";
import { RouteService } from "./application/route.service";
import { UserModule } from "../user/user.module";
import { POIModule } from "../poi/poi.module";
import { VehicleModule } from "../vehicle/vehicle.module";
import { DummyRoutingAdapter } from "./infrastructure/adapters/dummy-routing.adapter";
import { RouteRepository } from "./domain/route.repository";
import { InMemoryRouteRepository } from "./domain/in-memory-route.repository";
import { SupabaseRouteRepository } from "./infrastructure/supabase-route.repository";
import { RouteController } from "./route.controller";

@Module({
  controllers: [RouteController],
  imports: [
    UserModule,
    POIModule,
    VehicleModule     
  ],
  providers: [
    RouteService,
    {
      provide: RouteRepository,
      useClass: SupabaseRouteRepository
    },
    {
      provide: "RoutingAdapter",
      useClass: DummyRoutingAdapter,
    },
  ],
  exports: [RouteService],
})
export class RouteModule {}
