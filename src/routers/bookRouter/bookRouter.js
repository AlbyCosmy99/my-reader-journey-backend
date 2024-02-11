import express from 'express';
import cors from 'cors';
import tokenAuth from '../../middlewares/tokenAuth.js';
import { BookModel } from '../../database/schemas/bookSchema.js';

const bookRouter = express.Router();

bookRouter.use(cors());

bookRouter.get('/', tokenAuth, async (req, res) => {
    const filter = req.query.filter;
    const userId = req.payload.id;
    let queryConditions = { userId: userId };

    if (filter) {
        if(filter === "read") {
            queryConditions.read = true;
        } else if(filter === "to-read") {
            queryConditions.toRead = true;
        } else if(filter === "favorite") {
            queryConditions.favorite = true;
        }
    }

    try {
        const books = await BookModel.find(queryConditions);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

bookRouter.post('/', tokenAuth, async (req, res) => {
    const userId = req.payload.id;
    try {
        const newBook = new BookModel(req.body);
        newBook.userId = userId;
        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({
            "error": "Cannot save to db.",
            "details": error.message
        });
    }
});

export default bookRouter;
