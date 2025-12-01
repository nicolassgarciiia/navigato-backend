import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { UserService } from "./application/user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(@Body() body: any) {
    try {
      const user = await this.userService.register(body);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Post("login")
  async login(@Body() body: any) {
    try {
      const user = await this.userService.login(body.correo, body.contraseña);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Post("logout")
  async logout(@Body() body: any) {
    try {
      const user = await this.userService.logout(body.correo);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  @Get(":correo")
  async findByEmail(@Param("correo") correo: string) {
    try {
      const user = await this.userService.findByEmail(correo);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
