import express from 'express'
import auth from '../middleware/auth.js'
import { getAllNotification, getUnreadNotification, markAllNotifications, markOneNotification } from '../controller/notification.controller.js'

const notificationRoute = express()

notificationRoute.post("/get-unread-notify", auth, getUnreadNotification)
notificationRoute.post("/get-all-notify",auth,getAllNotification)
notificationRoute.put("/marked-one",auth,markOneNotification)
notificationRoute.post("/marked-all",auth,markAllNotifications)

export default notificationRoute