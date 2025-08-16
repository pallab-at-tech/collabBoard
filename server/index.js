import express from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { app, server } from './config/connectSocket.js'
import connectDB from './config/connectDB.js'
import userRoute from './routes/user.route.js'
import teamRouter from './routes/team.route.js'
import taskRoute from './routes/task.route.js'
import chatRoute from './routes/chat.route.js'


app.use(cors({
    credentials: true,
    origin: process.env.FRONTENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet({
    crossOriginResourcePolicy: false
}))


app.get("/", (req, res) => {
    return res.json({
        message: "Server is about to start..."
    })
})

// other api
app.use("/api/user", userRoute)
app.use("/api/teaming", teamRouter)
app.use("/api/task", taskRoute)
app.use("/api/chat", chatRoute)

const PORT = 8080 || process.env.PORT

connectDB().then(() => {

    server.listen(PORT, () => {
        console.log(`Server starting at http://localhost:${PORT}`)
    })

})