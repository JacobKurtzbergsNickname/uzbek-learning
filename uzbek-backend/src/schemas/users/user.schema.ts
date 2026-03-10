import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { v4 as uuidv4 } from "uuid";

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: "Users",
})
export class User {
  @Prop({ default: uuidv4, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  auth0Sub: string;

  @Prop()
  email?: string;

  @Prop({ type: [String], default: [] })
  roles?: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
