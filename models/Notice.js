const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NoticeSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Notice = mongoose.model("Notice", NoticeSchema);

module.exports = Notice;
