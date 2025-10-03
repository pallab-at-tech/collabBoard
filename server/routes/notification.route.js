import express from 'express'
import auth from '../middleware/auth.js'
import { getUnreadMessage } from '../controller/notification.controller.js'

const notificationRoute = express()

notificationRoute.post("/get-unread-notify", auth, getUnreadMessage)

export default notificationRoute