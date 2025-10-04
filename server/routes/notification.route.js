import express from 'express'
import auth from '../middleware/auth.js'
import { getAllNotification, getUnreadNotification } from '../controller/notification.controller.js'

const notificationRoute = express()

notificationRoute.post("/get-unread-notify", auth, getUnreadNotification)
notificationRoute.post("/get-all-notify",auth,getAllNotification)

export default notificationRoute