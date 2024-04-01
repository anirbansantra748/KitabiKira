const mongoose = require("mongoose")
const Schema = mongoose.Schema

const commentSchema = new Schema({
    comment: { type: String, required: true },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
})

const comment = mongoose.model("comment", commentSchema)
module.exports = comment