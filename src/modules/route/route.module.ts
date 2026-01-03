import { Module } from "@nestjs/common";
import { RouteService } from "./application/route.service";
import { UserModule } from "../user/user.module";
import { POIModule } from "../poi/poi.module";
import { VehicleModule } from "../vehicle/vehicle.module";
import { DummyRoutingAdapter } from "./infrastructure/adapters/dummy-routing.adapter";
import { RouteRepository } from "./domain/route.repository";
import { SupabaseRouteRepository } from "./infrastructure/supabase-route.repository";
import { RouteController } from "./route.controller";
import { OpenRouteRoutingAdapter } from "./infrastructure/adapters/openroute-routing.adapter";

@Module({
  imports: [
    UserModule,
    POIModule,
    VehicleModule     
  ],
  controllers: [RouteController],
  providers: [
    RouteService,
    {
      provide: RouteRepository,
      useClass: SupabaseRouteRepository
    },
    {
      provide: "RoutingAdapter",
      useClass: OpenRouteRoutingAdapter,
    },
  ],
  exports: [RouteService,
  RouteRepository
  ],
})
export class RouteModule {}
