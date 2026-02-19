import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { UsersService } from "./users.service";
import { User } from "../schemas/users/user.schema";

type MockModel = {
  findOneAndUpdate: jest.Mock;
  lean: jest.Mock;
  exec: jest.Mock;
};

describe("UsersService (Auth0)", () => {
  let service: UsersService;
  let userModel: MockModel;

  beforeEach(async () => {
    userModel = {
      findOneAndUpdate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it("should upsert a user by auth0Sub (create)", async () => {
    const fakeUser: Partial<User> = {
      id: "uuid-1",
      auth0Sub: "auth0|abc",
      email: "test@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userModel.exec.mockResolvedValueOnce(fakeUser);
    const result = await service.upsertFromAuth0({
      auth0Sub: "auth0|abc",
      email: "test@example.com",
    });
    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { auth0Sub: "auth0|abc" },
      expect.objectContaining({}),
      expect.objectContaining({ upsert: true }),
    );
    expect(result).toEqual(fakeUser);
  });

  it("should upsert a user by auth0Sub (update)", async () => {
    const fakeUser: Partial<User> = {
      id: "uuid-1",
      auth0Sub: "auth0|abc",
      email: "new@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userModel.exec.mockResolvedValueOnce(fakeUser);
    const result = await service.upsertFromAuth0({
      auth0Sub: "auth0|abc",
      email: "new@example.com",
    });
    expect(result?.email).toBe("new@example.com");
  });
});
