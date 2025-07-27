import { GraphQLObjectType, GraphQLID, GraphQLString } from 'graphql';
import { UserType } from './user.type.js';
import User from '../../DB/models/user.model.js';

export const NoteType = new GraphQLObjectType({
    name: 'Note',
    fields: () => ({
        _id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        owner: {
            type: UserType,
            resolve: async (parent) => {
                    return await User.findById(parent.ownerId);
                }
        }
    })
});
