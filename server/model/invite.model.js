import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    teamId : {
        type : mongoose.Schema.ObjectId,
        ref : "team",
        required : true
    },
    token : {
        type : String,
        required : true,
        unique : true
    },
    usedCount : {
        type : Number,
        default : 0
    },
    maxCount : {
        type : Number,
        default : 10
    },
    expireAt : {
        type : Date,
        default : ()=> Date.now() + 7 * 24 * 60 * 60 * 1000
    }
},{
    timestamps : true
})

const inviteModel = mongoose.model("invite",inviteSchema)
export default inviteModel