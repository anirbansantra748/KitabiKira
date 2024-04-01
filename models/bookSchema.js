const mongoose = require("mongoose");
const schema = mongoose.Schema;

const BookSchema = new schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  pdf: { type: String, required: true },
  photo: { type: String, required: true }, // Change to string type
  genre: { type: String, required: true },
  date: { type: Date, default: Date.now },
  owner: {
    type: schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: schema.Types.ObjectId,
      ref: "comment",
    },
  ],
});

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
