
import { getWordsCollection } from "@/db/getMongoConnection";
import { IWord, Word } from "@/models/word";
import
    express, { 
        Application, 
        Request as Q, 
        Response as A 
} from "express";
import { Result, sendCreatedResponse, sendDeletedResponse, sendRestoredResponse, sendUpdatedResponse } from "../utils/response-utils";

// Router setup
const wordRoutes = express.Router();

// DB setup
const wordsCollection = await getWordsCollection();

wordRoutes.get("/", async (q: Q, a: A)          => GET(q, a));
wordRoutes.get("/:id", async (q: Q, a: A)       => GET(q, a));
wordRoutes.post("/", async (q: Q, a: A)         => POST(q, a));
wordRoutes.put("/:id", async (q: Q, a: A)       => PUT(q, a));
wordRoutes.delete("/:id", async (q: Q, a: A)    => DELETE(q, a));

async function initializeWordRoutes(app: Application) {
    app.use("/words", wordRoutes);
}

export { initializeWordRoutes };

async function GET(req: Q, res: A) {
    console.log("GET /words called", req.params.id);

    // Fetch all words from the database
    if (req.params.id) {
        const word = await wordsCollection.findOne({ id: req.params.id });
        if (!word || word.deletedAt) {
            // If the word is not found or marked as deleted, return 404
            res.status(404).json({ message: "Word not found" });
            return;
        }
        res.json({
            word: word,
        });
        return;
    }
    const words = await wordsCollection.find().toArray();
    res.json({
        words: words,
    });
}

async function POST(req: Q, res: A) {
    const { word, translation, partOfSpeech } = req.body;
     const newWord: IWord = new Word(word, translation, partOfSpeech);

    // Check if the word already exists in the database
    const existingWord = await wordsCollection.findOne<IWord>({ word: newWord.word });
    if (existingWord) {
        if (existingWord.deletedAt) {
            const changedWord = {
                ...newWord,
                id: existingWord.id,
                createdAt: existingWord.createdAt,
            };
            // If the word is marked as deleted, restore it
            restoreWord(changedWord)
                .then(result => {
                    sendRestoredResponse(res, changedWord, result);
                }).catch(err => {
                    console.error("Error restoring word:", err);
                    res.status(500).json({ message: "Word could not be restored" });
                })
            return;
        }
        res.status(409).json({ message: "Word already exists" });
        return;
    }
    const result = await wordsCollection.insertOne(newWord);
    sendCreatedResponse(res, newWord, result);
    return;
}

async function PUT(req: Q, res: A) {
    const { id } = req.params;
    const { word, translation, partOfSpeech } = req.body;
    console.dir(["PUT /words called", id, word, translation, partOfSpeech]);

    // Check if the word already exists in the database
    const existingWord = await wordsCollection.findOne<IWord>({id: id});
    if (!existingWord) {
        res.status(409).json({ message: "Word does not exist" });
        return;
    }
    // Check if the words was previously deleted
    if (existingWord.deletedAt) {
        restoreWord(existingWord)
            .then(result => {
                sendRestoredResponse(res, existingWord, result);
            }).catch(err => {
                console.error("Error restoring word:", err);
                res.status(500).json({ message: "Word could not be restored" });
            })
        return;
    }
    // Update the word in the database
    const updatedAt = new Date();
    const result = await wordsCollection.updateOne(
        { id: id },
        { $set: { word, translation, partOfSpeech, updatedAt } }
    );
    // Compose the updated word object
    const updatedWord: IWord = {
        ...existingWord,
        word: word,
        translation: translation,
        partOfSpeech: partOfSpeech,
        updatedAt: updatedAt,
    };
    sendUpdatedResponse(res, updatedWord, result);
    return;
}

async function DELETE(req: Q, res: A) {
    const { id } = req.params;
    console.log("DELETE /words called", id);

    // Check if the word already exists in the database
    const existingWord = await wordsCollection.findOne<IWord>(
        { id: id } 
    );
    console.log("existingWord", existingWord);

    if (!existingWord) {
        res.status(409).json({ message: "Word does not exist" });
        return;
    }

    // Set the deletedAt field to mark the word as deleted
    const deletedAt = new Date();
    const result = await wordsCollection.updateOne(
        { id: id }, 
        { $set: { deletedAt } }
    )

    // Send the response with the deleted word object
    const deletedWord: IWord = {
        ...existingWord,
        deletedAt: deletedAt,
    };
    sendDeletedResponse(res, deletedWord, result);
    return;
}

async function restoreWord(word: IWord):Promise<Result> {
    // If the word is marked as deleted, restore it
    return await wordsCollection.updateOne(
        { id: word.id },
        { $set: { 
            word: word.word,
            translation: word.translation,
            partOfSpeech: word.partOfSpeech,
            createdAt: word.createdAt,
            updatedAt: new Date(),
            deletedAt: null,
        }}
    );
}