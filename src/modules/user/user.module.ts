import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserController } from "./user.controller";
import { UserService } from "./application/user.service";
import { UserRepository } from "./domain/user.repository";
import { SupabaseUserRepository } from "./infrastructure/supabase-user.repository";

@Module({
  imports: [ConfigModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: SupabaseUserRepository,
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}
