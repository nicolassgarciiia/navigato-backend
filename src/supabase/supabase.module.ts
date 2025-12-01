import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Module({
  imports: [ConfigModule],   
  providers: [
    {
      provide: SupabaseClient,
      useFactory: (config: ConfigService) => {
        const url = config.get<string>("SUPABASE_URL");
        const key = config.get<string>("SUPABASE_KEY");

        if (!url || !key) {
          throw new Error("Missing Supabase credentials");
        }

        return createClient(url, key);
      },
      inject: [ConfigService],
    },
  ],
  exports: [SupabaseClient],
})
export class SupabaseModule {}
