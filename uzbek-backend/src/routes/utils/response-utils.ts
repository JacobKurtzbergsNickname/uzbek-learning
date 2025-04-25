import { IWord } from "@/models/word";
import { Response } from "express";
import { InsertOneResult, UpdateResult } from "mongodb";

type Result = UpdateResult<Document> | InsertOneResult<Document>;

function sendResponse(res: Response, word: IWord, result: Result, verb: string): void {
    // If MongoDB operation is not acknowledged, send a 500 response
    if (!result.acknowledged) {
        res.status(500).json({ message: `Word could not be ${verb}` });
        return;
    }
    // Otherwise, send a 200 response
    res.status(200).json({ message: `Word ${verb}`, word: word });
}

function sendRestoredResponse(res: Response, word: IWord, result: Result): void {
    sendResponse(res, word, result, "restored");
}

function sendDeletedResponse(res: Response, word: IWord, result: Result): void {
    sendResponse(res, word, result, "deleted");
}

function sendCreatedResponse(res: Response, word: IWord, result: Result): void {
    sendResponse(res, word, result, "created");
}

function sendUpdatedResponse(res: Response, word: IWord, result: Result): void {
    sendResponse(res, word, result, "updated");
}

export {
    sendRestoredResponse,
    sendDeletedResponse,
    sendCreatedResponse,
    sendUpdatedResponse,
}