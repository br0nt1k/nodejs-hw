import { model, Schema } from "mongoose";
import { TAGS } from "../constants/tags.js";

export const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      trim: true,
      default: ''
    },
    tag: {
      type: String,
      enum: TAGS,
      default: 'Todo'
    },
    userId:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true
  }
)

noteSchema.index({title: 'text', content: 'text'})

export const Note = model('Note', noteSchema)

