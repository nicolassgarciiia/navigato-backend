import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SupabaseModule } from "../../supabase/supabase.module";
import { UserController } from "./user.controller";
import { UserService } from "./application/user.service";
import { UserRepository } from "./domain/user.repository";
import { SupabaseUserRepository } from "./infrastructure/supabase-user.repository";

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: SupabaseUserRepository,
    },
  ],
})
export class UserModule {}
