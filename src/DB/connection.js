import mongoose from "mongoose";



const database_connection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        console.log('Database connected successfully!');
    } catch (error) {
        console.log('Database connection failed!', error);
    }
}


export default database_connection





