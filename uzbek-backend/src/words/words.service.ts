import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Word, WordDocument } from "../schemas/words/word.schema";
import { CreateWordDto } from "./dto/create-word.dto";

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
  ) {}

  async findAll(language?: string): Promise<Word[]> {
    const filter = language ? { language } : {};
    return this.wordModel.find(filter).lean().exec();
  }

  // lookup by the custom `id` field instead of MongoDB _id
  async findOne(id: string): Promise<Word> {
    const doc = await this.wordModel.findOne({ id }).lean().exec();
    if (!doc) throw new NotFoundException("Word not found");
    return doc as Word;
  }

  async create(dto: CreateWordDto): Promise<Word> {
    const created = new this.wordModel(dto);
    return created.save();
  }

  // remove by custom `id` field
  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.wordModel.deleteOne({ id }).exec();
    return { deleted: result.deletedCount === 1 };
  }

  // Patch: partial update (PATCH) by `id` field
  async patch(id: string, dto: Partial<CreateWordDto>): Promise<Word> {
    const update = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined),
    );

    const updated = await this.wordModel
      .findOneAndUpdate(
        { id },
        { $set: update },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    if (!updated) throw new NotFoundException("Word not found");
    return updated as Word;
  }

  // Put: full replace (PUT) by `id` field
  async put(id: string, dto: CreateWordDto): Promise<Word> {
    const replaced = await this.wordModel
      .findOneAndUpdate({ id }, dto, {
        new: true,
        overwrite: true,
        runValidators: true,
      })
      .lean()
      .exec();

    if (!replaced) throw new NotFoundException("Word not found");
    return replaced as Word;
  }
}
