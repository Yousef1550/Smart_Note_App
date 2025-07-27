import mongoose from "mongoose";






const noteSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})




const Note = mongoose.models.Note || mongoose.model('Note', noteSchema)


export default Note