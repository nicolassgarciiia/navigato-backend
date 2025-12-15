import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { POIService } from "./application/poi.service";
import { CreatePOIDto } from "./dto/create-poi.dto";
import {
  InvalidPOINameError,
  DuplicatePOINameError,
  InvalidCoordinatesFormatError,
  AuthenticationRequiredError,
  GeocodingServiceUnavailableError,
  DatabaseConnectionError,
} from "./domain/errors";

@Controller("pois")
export class POIController {
  constructor(private readonly poiService: POIService) {}

  @Post()
  async create(@Body() body: CreatePOIDto) {
    try {
      return await this.poiService.createPOI(
        body.correo,
        body.nombre,
        body.latitud,
        body.longitud
      );
    } catch (error) {
      if (
        error instanceof InvalidPOINameError ||
        error instanceof DuplicatePOINameError ||
        error instanceof InvalidCoordinatesFormatError
      ) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof AuthenticationRequiredError) {
        throw new UnauthorizedException(error.message);
      }

      if (error instanceof GeocodingServiceUnavailableError) {
        throw new ServiceUnavailableException(error.message);
      }

      if (error instanceof DatabaseConnectionError) {
        throw new InternalServerErrorException(error.message);
      }

      throw error;
    }
  }
}
