import { Test } from "@nestjs/testing";
import { UserModule } from "../../../src/modules/user/user.module";
import { UserService } from "../../../src/modules/user/application/user.service";
import * as dotenv from "dotenv";
import { TEST_EMAIL} from "../../helpers/test-constants";

dotenv.config();

describe("HU03 – Cerrar sesión", () => {
  let service: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    service = moduleRef.get(UserService);

  });

  // ======================================================
  // HU03_E01 – Cierre de sesión exitoso
  // ======================================================
  test("HU03_E01 – Cierre de sesión exitoso", async () => {
    await expect(service.logout(TEST_EMAIL)).resolves.not.toThrow();
  });

  // ======================================================
  // HU03_E02 – Idempotencia (Cerrar sesión repetida)
  // ======================================================
  test("HU03_E02 – Cerrar sesión repetida (Idempotencia)", async () => {
    await service.logout(TEST_EMAIL);

    await expect(service.logout(TEST_EMAIL)).resolves.not.toThrow();
  });
});
