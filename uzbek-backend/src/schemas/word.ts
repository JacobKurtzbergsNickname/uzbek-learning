import { Word } from '@/models/word';
import {Connection, Schema } from 'mongoose';

const WordSchema = new Schema<Word>();

function initializeUzbekWordModel(db: Connection) {
    db.model<Word>('Word', WordSchema, 'Words');
}

export { WordSchema as Word, initializeUzbekWordModel };