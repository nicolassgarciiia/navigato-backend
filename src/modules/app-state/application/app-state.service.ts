import { Injectable } from "@nestjs/common";
import { ApplicationState } from "../domain/app-state.entity";

@Injectable()
export class AppStateService {
  async restoreApplicationState(
    userEmail: string
  ): Promise<ApplicationState> {
    throw new Error("NotImplemented");
  }
}
