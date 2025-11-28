import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user.repository";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(data: any): Promise<any> {
    throw new Error("Not implemented register()");
  }
  async deleteByEmail(email: string): Promise<void> {
    throw new Error("Not implemented deleteByEmail()");
  }
}
