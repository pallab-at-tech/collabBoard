import mongoose from 'mongoose'


const RoleSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.ObjectId,
        ref: "team"
    },
    name: {
        type: String,
        required: [true, "provide team-name"]
    },
    organization_type: {
        type: String,
        required: [true, "Provide organization type"]
    },
    role: {
        type: String,
        enum: ["LEADER", "CO-LEADER", "MEMBER"],
        default: "MEMBER"
    }
})

const teamRequest = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.ObjectId,
        ref: "team"
    },
    teamName: {
        type: String,
        default: ""
    },
    requestedBy_id: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    requestedBy_userId: {
        type: String,
        default: ""
    }

})

const notify = new mongoose.Schema({
    notifyId : {
        type : mongoose.Schema.ObjectId,
        ref : "notification"
    }
},{
    timestamps : true
})


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "provided name"]
    },
    email: {
        type: String,
        required: [true, "provided email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "provided password"]
    },
    userId: {
        type: String,
        default: ""
    },
    about: {
        type: String,
        default: ""
    }
    // ,
    // notification: [
    //     notify
    // ]
    ,
    roles: [
        RoleSchema
    ],
    request: [
        teamRequest
    ],
    avatar: {
        type: String,
        default: ""
    },
    verify_code: {
        type: String,
        default: ""
    },
    verify_email: {
        type: Boolean,
        default: false
    },
    refresh_token: {
        type: String,
        default: ""
    },
    forgot_Password_otp: {
        type: String,
        default: ""
    },
    forgot_Password_expiry: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

userSchema.index(
    {
        name: "text",
        userId: "text",
        email: "text"
    },
    {
        weights: {
            name: 5,
            userId: 10,
            email: 10
        },
        name: "user_text_search_index"
    },
)

const userModel = mongoose.model("user", userSchema)
export default userModel