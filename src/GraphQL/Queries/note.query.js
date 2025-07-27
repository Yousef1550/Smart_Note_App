import { GraphQLList, GraphQLID, GraphQLString, GraphQLInt } from 'graphql';
import { NoteType } from '../Types/note.type.js';
import Note from '../../DB/models/note.model.js';



export const notes = {
    type: new GraphQLList(NoteType), 
    args: {
        ownerId: { type: GraphQLID },
        title: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
        page: { type: GraphQLInt },
        limit: { type: GraphQLInt },
    },
    resolve: async (_, args) => {
        const { ownerId, title, startDate, endDate, page = 1, limit = 10 } = args;
        const query = {};

        
        if (ownerId) query.ownerId = ownerId;
        if (title) query.title = { $regex: title, $options: 'i' }; 
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        return await Note.find(query)
        .skip((page - 1) * limit)
        .limit(limit);
    }
};
