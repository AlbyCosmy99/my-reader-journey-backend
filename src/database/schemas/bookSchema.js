import mongoose from "mongoose";
const { Schema } = mongoose;

const bookSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    toRead: {
        type: Boolean,
        default: false
    },
    favorite: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/002/870/495/small_2x/blank-book-cover-over-gray-background-vector.jpg"
    },
    author: String,
    borrowed: {
        type: Boolean,
        default: false
    },
    loaned: {
        type: Boolean,
        default: false
    },
    startReadingDate: {
        type: Date,
        default: null
    },
    endReadingDate: {
        type: Date,
        default: Date.now(),
        validate: {
            validator: function(endDate) {
              return !endDate || !this.startReadingDate || endDate > this.startReadingDate;
            },
            message: 'endReadingDate must be after startReadingDate.'
          }
    },
    publicationDate: {
        type: Date,
        default: null
    },
    isbn: {
        type: String,
        default: null
    },
    genre: {
        type: String,
        default: null
    },
    publishing_house: {
        type: String,
        default: null
    },
    pages: {
        type: Number,
        default: null
    },
    price: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        default: 6
    },
    category: {
        type: String,
        default: null
    },
    language: {
        type: String,
        default: "English"
    },
    description: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    dateAdded: {
        type: Date,
        default: Date.now()
    }
})

export const BookModel = mongoose.model('books', bookSchema)