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

  async findOne(id: string): Promise<Word> {
    const doc = await this.wordModel.findById(id).lean().exec();
    if (!doc) throw new NotFoundException("Word not found");
    return doc as Word;
  }

  async create(dto: CreateWordDto): Promise<Word> {
    const created = new this.wordModel(dto);
    return created.save();
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.wordModel.deleteOne({ _id: id }).exec();
    return { deleted: result.deletedCount === 1 };
  }
}
