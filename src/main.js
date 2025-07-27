import express from 'express'
import { config } from 'dotenv'
import database_connection from './DB/connection.js'
import routerHandler from './utils/router-handler.utils.js'
import cors from 'cors'
import { graphqlHTTP } from 'express-graphql';
import { schema } from './GraphQL/schema.js';
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
config()


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15min
    max: 100, 
    message: 'Too many requests from this IP, please try again later.',
})


const bootstrap = async () => {
    const app = express()
    await database_connection()
    

    app.use(cors({
        origin: ['http://localhost:3000']
    }))

    app.use(helmet())

    app.use(apiLimiter)

    app.use(express.json())

    routerHandler(app)

    app.use('/graphql', graphqlHTTP({
        schema,
        graphiql: true
    }));
    
    app.use((req, res) => {
        res.status(404).json({ message: 'This router is not exist' });
    });
    
    const port = process.env.PORT
    app.listen(port, () => {
        console.log(`Server is running on port ${port}!`);
    })
}


export default bootstrap