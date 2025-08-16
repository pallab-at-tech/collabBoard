import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    notification_type : {
        type : String,
        default : ""
    },
    data : {
        type : String,
        default : ""
    },
    link : {
        type : String,
        default : ""
    },
    isRead : {
        type : Boolean,
        default : false
    }
},{
    timestamps : true
})

const  notificationModel = mongoose.model("notification" , notificationSchema)
export default notificationModel