import { Router } from "express";
import { errorHandler } from "../../Middleware/error-handler.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import { createNoteService, deleteNoteService, summarizeNoteService } from "./services/note.service.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { createNoteSchema, deleteNoteSchema, summarizeNoteSchema } from "../../Validators/Note/note.schema.js";



const noteController = Router()

noteController.use(authenticationMiddleware())

noteController.post('/createNote', errorHandler(validationMiddleware(createNoteSchema)), errorHandler(createNoteService))



noteController.delete('/deleteNote/:noteId',
    errorHandler(validationMiddleware(deleteNoteSchema)), 
    errorHandler(deleteNoteService)
)

noteController.post('/notes/:noteId/summarize',
    errorHandler(validationMiddleware(summarizeNoteSchema)),
    errorHandler(summarizeNoteService)
)

export default noteController