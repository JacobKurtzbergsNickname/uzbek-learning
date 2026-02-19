import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { User, UserDocument } from "../schemas/users/user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async upsertFromAuth0({
    auth0Sub,
    email,
  }: {
    auth0Sub: string;
    email?: string;
  }) {
    const update = {
      auth0Sub,
      email,
      updatedAt: new Date(),
    } as Partial<User>;

    const doc = await this.userModel
      .findOneAndUpdate(
        { auth0Sub },
        { $set: update, $setOnInsert: { id: uuidv4(), createdAt: new Date() } },
        { upsert: true, new: true, runValidators: true },
      )
      .lean()
      .exec();

    return doc as User;
  }
}
