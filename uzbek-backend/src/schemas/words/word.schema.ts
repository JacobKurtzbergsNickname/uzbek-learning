import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { v4 as uuidv4 } from "uuid";

export type WordDocument = Word & Document;

@Schema({
  timestamps: true,
  collection: "Words",
})
export class Word {
  @Prop({ default: uuidv4, unique: true })
  id: string;

  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  translation: string;

  @Prop({ required: true })
  partOfSpeech: string;

  @Prop({ required: true })
  language: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

const WordSchema = SchemaFactory.createForClass(Word);

export { WordSchema };
