import { User } from "./user.entity";

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;               
  abstract findById(id: string): Promise<User | null>;   
  abstract findByEmail(email: string): Promise<User | null>;
  abstract update(user: User): Promise<void>;            
  abstract deleteByEmail(email: string): Promise<void>;
}