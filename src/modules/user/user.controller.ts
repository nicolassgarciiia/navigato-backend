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
import { RegisterUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserEmailDto } from "./dto/user-email.dto";


@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ================================================================
  // TU HANDLE ERROR ORIGINAL (Intacto para no cambiar mensajes)
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
        // console.error("Error no controlado:", error); // Descomenta para depurar
        throw new InternalServerErrorException(
          "Ha ocurrido un error inesperado en el servidor."
        );
    }
  }

  // ===============================
  // REGISTRO (Usando DTO)
  // ===============================
  @Post("register")
  async register(@Body() createUserDto: RegisterUserDto) { // <--- Cambio clave: Tipado
    try {
      const user = await this.userService.register(createUserDto);
      return { ok: true, user }; // Devuelve exactamente lo mismo que antes
    } catch (error) {
      this.handleError(error);
    }
  }

  // ===============================
  // LOGIN (Usando DTO)
  // ===============================
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto) { // <--- Cambio clave: Tipado
    try {
      // Accedemos a las propiedades del DTO con seguridad
      return await this.userService.login(loginDto.correo, loginDto.contraseña);
    } catch (error) {
      this.handleError(error);
    }
  }

  // ===============================
  // LOGOUT (Usando DTO)
  // ===============================
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: UserEmailDto) { // <--- Cambio clave: Tipado
    try {
      await this.userService.logout(logoutDto.correo);
      return { ok: true, message: "Sesión cerrada correctamente." };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ===============================
  // ELIMINAR CUENTA (Usando DTO)
  // ===============================
  @Post("delete") // Mantenemos POST si así lo tenías en tus tests
  async deleteAccount(@Body() deleteDto: UserEmailDto) { // <--- Cambio clave: Tipado
    try {
      const user = await this.userService.deleteAccount(deleteDto.correo);
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
