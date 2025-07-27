import mongoose from "mongoose";





const blackListTokens_schema = mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        unique: true
    },
    expiryDate: {
        type: String,
        required: true
    }
}, {timestamps: true})


const BlackListTokens = mongoose.models.blackListTokens || mongoose.model('blackListTokens', blackListTokens_schema)


export default BlackListTokens