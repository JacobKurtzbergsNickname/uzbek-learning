import express, { Request, Response } from "express";
import { initializeUzbekDb } from "./db/getMongoConnection";
import { Word } from "./models/word";
import { initializeWordRoutes } from "./routes/words/words";

// Create a new express application instance
const app = express();

// new Router instance
const wordRoutes = express.Router();
app.use("/words", wordRoutes);

// Middleware to parse JSON request bodies
app.use(express.json());

// Add routes to the app
await initializeWordRoutes(app);

// Define the root path with a greeting message
app.get("/", async (_: Request, res: Response) => GET(res));

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => startServer());

async function GET(res: Response) {
    res.json({
        message: "Welcome to the Uzbek Dictionary API!",
    });
}

function startServer() {
    console.log(`The server is running at http://localhost:${port}`);
}