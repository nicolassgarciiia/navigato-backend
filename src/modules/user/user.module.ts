import { Module } from "@nestjs/common";
import { UserService } from "./application/user.service";
import { UserRepository } from "./domain/user.repository";
import { SupabaseUserRepository } from "./infrastructure/supabase-user.repository";

@Module({
  providers: [
    UserService,
    {
      provide: UserRepository,
      useClass: SupabaseUserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
