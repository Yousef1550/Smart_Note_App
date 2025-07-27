import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { notes } from './Queries/note.query.js';

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        notes
    }
});

export const schema = new GraphQLSchema({
    query: RootQuery
});
