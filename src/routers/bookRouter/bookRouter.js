import express from 'express';
import cors from 'cors';
import tokenAuth from '../../middlewares/tokenAuth.js';
import { BookModel } from '../../database/schemas/bookSchema.js';

const bookRouter = express.Router();

bookRouter.use(cors());

bookRouter.get('/', tokenAuth, async (req, res) => {
    const filter = req.query.filter;
    const sortBy = req.query.sortBy;
    const userId = req.payload.id;
    let queryConditions = { userId: userId };

    if (filter) {
        if(filter === "books-read") {
            queryConditions.read = true;
        } else if(filter === "books-to-read") {
            queryConditions.toRead = true;
        } else if(filter === "favorite-books") {
            queryConditions.favorite = true;
        }
    }

    try {
        let sortOptions = {};
        if (sortBy) {
            const sortDirection = sortBy.startsWith('-') ? 'desc' : 'asc';
            const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
            sortOptions[sortField] = sortDirection;
        }

        const books = await BookModel.find(queryConditions).sort(sortOptions);
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
