import notificationModel from "../model/notification.model.js"


export const getUnreadNotification = async (request, response) => {
    try {
        const userId = request.userId
        const { page = 1, limit = 10 } = request.body || {}

        const skip = (page - 1) * limit

        const notifications = await notificationModel.find({ recipient: userId, isRead: false }).sort({ createdAt: -1 }).skip(skip).limit(limit)
        const count = await notificationModel.countDocuments({ recipient: userId, isRead: false });

        return response.json({
            message: "Got all unread notification",
            notifications: notifications,
            count: count,
            total_page: Math.ceil(count / limit),
            curr_page: page,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const getAllNotification = async (request, response) => {
    try {
        const userId = request.userId
        const { page = 1, limit = 10 } = request.body || {}

        const skip = (page - 1) * limit

        const all_notifications = await notificationModel.find({ recipient: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit)
        const total = await notificationModel.countDocuments({ recipient: userId })

        return response.json({
            notifications: all_notifications,
            total: total,
            total_page: Math.ceil(total / limit),
            curr_page: page,
            message: "Got all notification",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const markOneNotification = async (request, response) => {
    try {
        const userId = request.userId
        const { notify_id } = request.body || {}

        if (!notify_id) {
            return response.status(400).json({
                message: "Notification Id required!",
                error: true,
                success: false
            })
        }

        const notification = await notificationModel.findOneAndUpdate(
            { _id: notify_id, recipient: userId },
            { isRead: true },
            { new: true }
        )

        return response.json({
            message: "Marked one",
            notify_id: notification._id,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const markAllNotifications = async (request, response) => {
    try {
        const userId = request.userId
        await notificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true })

        return response.json({
            message : "Marked all",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
