import { Note } from "../models/note.js"
import createHttpError from "http-errors";

export const getAllNotes = async (req, res) => {
  const { tag, search, page = 1, perPage = 10, } = req.query;

  const skip = (page - 1) * perPage;

  const noteQuery = Note.find({userId: req.user._id});

  if (tag) {
  noteQuery.where('tag').equals(tag)
  }
  if (search) {
  noteQuery.where({$text:{$search: search}})
  }

  const [totalNotes, notes] = await Promise.all([
    noteQuery.clone().countDocuments(),
    noteQuery.skip(skip).limit(perPage)
  ])

  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({
    page, perPage, totalNotes, totalPages, notes
  })


}

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params
  const note = await Note.findOne({_id: noteId, userId: req.user._id})
  if (!note) {
    next(createHttpError(404, 'Note not found'))
    return
  }
  res.status(200).json(note);
}

export const createNote = async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id
   })
  res.status(201).json(note)
}

export const deleteNote = async (req, res, next) => {
  const {noteId} = req.params
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id
  })
  if (!note) {
    next(createHttpError(404, 'Note not found'))
    return
  }
  res.status(200).json(note)
}

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    { new: true },
  )
  if (!note) {
    next(createHttpError(404, 'Note not found'))
    return
  }
  res.status(200).json(note)
}
