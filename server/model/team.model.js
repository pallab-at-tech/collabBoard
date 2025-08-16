import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    role: {
        type: String,
        enum: ["LEADER", "CO-LEADER", "MEMBER"],
        default: "MEMBER"
    },
    userName: {
        type: String,
        default: ""
    }
})

const requestSchema = new mongoose.Schema({
    sendTo_userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    sendTo_userName: {
        type: String,
        default: ""
    },
    sendBy_userId: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    sendBy_userName: {
        type: String,
        default: ""
    }
},
    {
        timestamps: true
    }
)



const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "provide team-name"]
    },
    description: {
        type: String,
        default: ""
    },
    organization_type: {
        type: String,
        required: [true, "Provide organization type"]
    },
    member: [
        memberSchema
    ],
    request_send: [
        requestSchema
    ]
}, {
    timestamps: true
})

const teamModel = mongoose.model("team", teamSchema)
export default teamModel