import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      return false;
    }

    req.user = {
      email: data.user.email,
      id: data.user.id,
    };

    return true;
  }
}
