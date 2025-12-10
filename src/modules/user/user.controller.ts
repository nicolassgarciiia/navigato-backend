import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpException
} from "@nestjs/common";
import { UserService } from "./application/user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ================================================================
  // HELPER PRIVADO: Traducción de errores del dominio → HTTP
  // ================================================================
  private handleError(error: any): never {
    const msg = error.message;

    switch (msg) {
      // --- LOGIN / SESIÓN ---
      case "InvalidCredentialsError":
      case "AuthLoginError":
        throw new UnauthorizedException("Correo o contraseña incorrectos.");

      case "UserNotFoundError":
        throw new NotFoundException("No existe ningún usuario con este correo.");

      // --- REGISTRO ---
      case "EmailAlreadyRegisteredError":
        throw new ConflictException("Este correo ya está registrado.");

      case "InvalidEmailFormatError":
        throw new BadRequestException("Formato de correo electrónico inválido.");

      case "InvalidPasswordError":
        throw new BadRequestException(
          "Contraseña débil: debe tener 8–16 caracteres, mayúscula, minúscula, número y símbolo."
        );

      case "PasswordsDoNotMatchError":
        throw new BadRequestException("Las contraseñas no coinciden.");

      case "PrivacyPolicyNotAcceptedError":
        throw new BadRequestException("Debes aceptar la política de privacidad.");

      case "InvalidPersonalInformationError":
        throw new BadRequestException("Nombre o apellidos incompletos.");
      case "EmailNotConfirmedError":
        throw new UnauthorizedException(
          "Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo y haz clic en el enlace de confirmación."
        );
      // Default (500)
      default:
        console.error("Error no controlado:", error);
        throw new InternalServerErrorException(
          "Ha ocurrido un error inesperado en el servidor."
        );
    }
  }

  // ===============================
  // REGISTRO
  // ===============================
  @Post("register")
  async register(@Body() body: any) {
    try {
      const user = await this.userService.register(body);
      return { ok: true, user };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ===============================
  // LOGIN
  // ===============================
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    try {
      const { correo, contraseña } = body;
      return await this.userService.login(correo, contraseña);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ===============================
  // LOGOUT
  // ===============================
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: any) {
    try {
      await this.userService.logout(body.correo);
      return { ok: true, message: "Sesión cerrada correctamente." };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ===============================
  // ELIMINAR CUENTA
  // ===============================
  @Post("delete")
  async deleteAccount(@Body() body: any) {
    try {
      const user = await this.userService.deleteAccount(body.correo);
      return { ok: true, user };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ===============================
  // BUSCAR POR EMAIL
  // ===============================
  @Get(":correo")
  async findByEmail(@Param("correo") correo: string) {
    try {
      const user = await this.userService.findByEmail(correo);
      if (!user) throw new Error("UserNotFoundError");
      return user;
    } catch (error) {
      this.handleError(error);
    }
  }
}
