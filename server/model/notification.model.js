import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    type: {
        type: String,
        enum: [
            "TASK ASSIGNED",
            "TASK COMPLETED",
            "CHAT RELATED",
            "TEAM INVITE",
            "SYSTEM ALERT",
            "OTHER",
            "TEAM UPDATE",
        ],
        required: true,
    },
    content: {
        type: String,
        default: ""
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    navigation_link: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
})

const notificationModel = mongoose.model("notification", notificationSchema)
export default notificationModel