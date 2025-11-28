import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";
import { User } from "../domain/user.entity";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseUserRepository implements UserRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async save(user: User): Promise<void> {
    throw new Error("Not implemented Supabase.save()");
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error("Not implemented Supabase.findByEmail()");
  }

  async update(user: User): Promise<void> {
    throw new Error("Not implemented Supabase.update()");
  }

  async deleteByEmail(email: string): Promise<void> {
    throw new Error("Not implemented Supabase.deleteByEmail()");
  }
}
