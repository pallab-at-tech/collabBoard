import express from 'express'
import auth from '../middleware/auth.js'
import { fetchAllMessages, getConversationDetails, getPreviousChatUsers } from '../controller/chat.controller.js'

const chatRoute = express()

chatRoute.get("/get-all-participants-details", auth, getPreviousChatUsers)
chatRoute.post("/get-all-messages", auth, fetchAllMessages)
chatRoute.get("/get-group-details", auth, getConversationDetails)

export default chatRoute