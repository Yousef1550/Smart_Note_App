import Joi from "joi";




export const createNoteSchema = {
    body: Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required()
    })
}


export const deleteNoteSchema = {
    params: Joi.object({
        noteId: Joi.string().hex().length(24).required()
    }) 
}


export const summarizeNoteSchema = {
    params: Joi.object({
        noteId: Joi.string().hex().length(24).required()
    }) 
}
