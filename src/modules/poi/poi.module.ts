import { Module } from "@nestjs/common";
import { POIController } from "./poi.controller";
import { POIService } from "./application/poi.service";

@Module({
  controllers: [POIController],
  providers: [
    {
      provide: POIService,
      useValue: {}, 
    },
  ],
})
export class POIModule {}
