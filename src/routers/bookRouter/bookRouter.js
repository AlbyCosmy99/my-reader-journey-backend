import express from "express";
import cors from "cors";
import tokenAuth from "../../middlewares/tokenAuth.js";
import { BookModel } from "../../database/schemas/bookSchema.js";

const bookRouter = express.Router();

bookRouter.use(cors());

bookRouter.get("/", tokenAuth, async (req, res) => {
  const filter = req.query.filter;
  const sortBy = req.query.sortBy;
  const userId = req.payload.id;
  const take = req.query.take ? parseInt(req.query.take, 10) : null;
  let queryConditions = { userId: userId };

  if (filter) {
    if (filter === "books-read") {
      queryConditions.read = true;
    } else if (filter === "books-to-read") {
      queryConditions.toRead = true;
    } else if (filter === "favorite-books") {
      queryConditions.favorite = true;
    } else if (filter === "top-rating-books") {
      queryConditions.rating = 10;
    }
  }

  try {
    let sortOptions = {};
    if (sortBy) {
      const sortDirection = sortBy.startsWith("-") ? "desc" : "asc";
      const sortField = sortBy.startsWith("-") ? sortBy.substring(1) : sortBy;
      sortOptions[sortField] = sortDirection;
    }

    let query = BookModel.find(queryConditions).sort(sortOptions);

    if (take && take > 0) {
      query = query.limit(take);
    }

    const books = await query;

    return res.status(200).json({ books, sortedBy: sortOptions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

bookRouter.get("/:bookId", tokenAuth, async (req, res) => {
  let bookId = req.params.bookId;
  const userId = req.payload.id;
  try {
    let book = await BookModel.find({ userId: userId, _id: bookId });
    return res.status(200).json({ book });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

bookRouter.post("/", tokenAuth, async (req, res) => {
  const userId = req.payload.id;
  try {
    const newBook = new BookModel(req.body);
    newBook.userId = userId;
    await newBook.save();
    return res.status(201).json(newBook);
  } catch (error) {
    return res.status(400).json({
      error: "Cannot save to db.",
      details: error.message,
    });
  }
});

bookRouter.put("/:bookId/favorite", tokenAuth, async (req, res) => {
  const userId = req.payload.id;
  const bookId = req.params.bookId;

  try {
    let book = await BookModel.findOne({ userId: userId, _id: bookId });
    if (book) {
      book.favorite = !book.favorite;
      await book.save();
      return res.status(200).json(book);
    } else {
      return res.status(404).json({
        error: "Cannot find book.",
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: "Cannot save to db.",
      details: error.message,
    });
  }
});

bookRouter.delete("/:bookId", tokenAuth, async (req, res) => {
  const userId = req.payload.id;
  const bookId = req.params.bookId;
  try {
    await BookModel.deleteOne({ userId: userId, _id: bookId });
    return res.status(204).end();
  } catch (error) {
    return res.status(400).json({
      error: "Cannot save to db.",
      details: error.message,
    });
  }
});

export default bookRouter;
