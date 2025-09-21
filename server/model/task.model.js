import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    assignby: {
        type: String,
        default: ""
    },
    assignTo: [
        {
            type: String,
            default: ""
        }
    ],
    status: {
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
    aditional_link: [
        {
            type: Object,
            default: {}
        }
    ],
    dueDate: {
        type: String,
        default: ""
    },
    dueTime: {
        type: String,
        default: ""
    },
    labels: [
        {
            type: String,
            default: ""
        }
    ]
},
    {
        timestamps: true
    }
)


const columnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tasks: [taskSchema],
    reportSubmit : [
        {
            report_id : {
                type : mongoose.Schema.ObjectId,
                ref : "report",
                default : null
            },
            taskId : {
                type : mongoose.Schema.ObjectId,
                default : null
            }
        }
    ]
})

const submitReport = new mongoose.Schema({
    text: {
        type: String,
        default: ""
    },
    submitBy: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    submitByUserId: {
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
    aditional_link: [
        {
            type: Object,
            default: {}
        }
    ]
}, {
    timestamps: true
})

const taskBoardSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.ObjectId,
        ref: "team"
    },
    name: {
        type: String,
        required: true
    },
    column: [
        columnSchema
    ],

}, {
    timestamps: true
})

const taskModel = mongoose.model("taskboard", taskBoardSchema)
const reportModel = mongoose.model("report",submitReport)

export default taskModel
export  {
    reportModel
}