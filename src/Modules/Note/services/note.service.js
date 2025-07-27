import Note from "../../../DB/models/note.model.js"
import axios from 'axios';
import { config } from 'dotenv'
config()




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


