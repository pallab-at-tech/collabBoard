import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    senderName: {
        type: String,
        default: ""
    },
    optional_msg: {
        type: String,
        default: ""
    },
    text: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    video: {
        type: String,
        default: ""
    },
    other_fileUrl_or_external_link: {
        type: String,
        default: ""
    },
    readBy: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    ]
}, {
    timestamps: true
})


const conversationSchema = new mongoose.Schema({
    group_type: {
        type: String,
        enum: ["PRIVATE", "GROUP"],
        required: [true, "give private or group chat"]
    },
    group_image: {
        type: String,
        default: ""
    },
    group_name: {
        type: String,
        default: ""
    },
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        },
    ],
    admin: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user",
            default: ""
        }
    ],
    messages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "message"
        }
    ],


}, {
    timestamps: true
})

const messageModel = mongoose.model("message", messageSchema)
const conversationModel = mongoose.model("conversation", conversationSchema)

export { messageModel, conversationModel }