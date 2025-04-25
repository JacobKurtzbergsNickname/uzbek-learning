import mongoose, { Mongoose } from 'mongoose';
import { config } from 'dotenv';
import { initializeUzbekWordModel } from '@/schemas/word';

async function getMongoConnection():Promise<Mongoose> {
    config();
    const uri = process.env.MONGODB_URI ?? "";
    return await mongoose.connect(uri);
}

async function initializeUzbekDb() {
    const connection = await getMongoConnection();
    const uzbekDb = connection.connection.useDb("Uzbek");
    initializeUzbekWordModel(uzbekDb);
    return uzbekDb;
}

async function getWordsCollection() {
    const uzbekDb = await initializeUzbekDb();
    const wordsCollection = uzbekDb.collections["Words"];
    return wordsCollection;
}

export { 
    getMongoConnection, 
    initializeUzbekDb, 
    getWordsCollection 
};