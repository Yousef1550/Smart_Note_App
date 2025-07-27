import Note from "../../../DB/models/note.model.js"
import axios from 'axios';
import { config } from 'dotenv'
config()



/**
 * Creates a new note for the authenticated user.
 * 
 * Steps:
 * 1. Extracts the note title and content from the request body.
 * 2. Associates the note with the authenticated user's ID (`ownerId`).
 * 3. Saves the note in the database and returns it in the response.
 * 
 * Assumes:
 * - `req.authUser._id` contains the authenticated user's ID.
 * - `Note` is a Mongoose model with fields: title, content, and ownerId.
 * 
 * @function createNoteService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.authUser - Contains authenticated user info (_id)
 * @param {Object} req.body - Contains title and content of the note
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created note data
 */
export const createNoteService = async (req, res) => {
    const { _id } = req.authUser
    const { title, content } = req.body

    const note = await Note.create({
        title,
        content,
        ownerId: _id
    })
    return res.status(200).json({message: 'Note created successfully', note})
}




/**
 * Deletes a specific note owned by the authenticated user.
 * 
 * Steps:
 * 1. Retrieves the note by ID from request parameters.
 * 2. Checks if the note exists.
 * 3. Verifies that the authenticated user is the owner of the note.
 * 4. Deletes the note from the database.
 * 
 * Assumes:
 * - `req.authUser._id` contains the authenticated user's ID.
 * - `note.ownerId` is the user ID who created the note.
 * 
 * @function deleteNoteService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.authUser - Contains authenticated user info (_id)
 * @param {Object} req.params - Contains noteId (ID of the note to delete)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */
export const deleteNoteService = async (req, res) => {
    const { _id } = req.authUser
    const { noteId } = req.params

    const note = await Note.findById(noteId)
    if(!note){
        return res.status(404).json({message: 'Note not found'})
    }

    if(_id.toString() !== note.ownerId.toString()){
        return res.status(401).json({message: 'Unauthorized, you must be the note owner to perfrom this action'})
    }

    await Note.findByIdAndDelete(noteId)
    return res.status(200).json({message: 'Note deleted successfully'})
}



/**
 * Summarizes the content of a specific note using HuggingFace's Pegasus model.
 * 
 * Steps:
 * 1. Finds the note by ID from request parameters.
 * 2. Sends the note content to HuggingFace's Pegasus summarization API.
 * 3. Returns the generated summary in the response.
 * 
 * Assumes:
 * - The note exists and contains a `content` field.
 * - HuggingFace API key is set in `process.env.HUGGINGFACE_API_KEY`.
 * - The response from HuggingFace API includes `summary_text` in the first item.
 * 
 * @function summarizeNoteService
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Contains noteId (ID of the note to summarize)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with the summarized text or error message
 */
export const summarizeNoteService = async (req, res) => {
    const { noteId } = req.params
    const note = await Note.findById(noteId)
    if(!note){
        return res.status(404).json({message: 'Note not found'})
    }
    
    const { content } = note
    
    const response = await axios.post(
        'https://api-inference.huggingface.co/models/google/pegasus-xsum',
        { inputs: content },
        {
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            },
        }
    );

    const summary = response.data[0].summary_text;

    return res.status(200).json({message: 'Note summarized successfully', summary})
}


