import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type WordDocument = Word & Document;

@Schema({
  timestamps: true,
  collection: "Words",
})
export class Word {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  translation: string;

  @Prop({ required: true })
  partOfSpeech: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

const WordSchema = SchemaFactory.createForClass(Word);

export { WordSchema };
