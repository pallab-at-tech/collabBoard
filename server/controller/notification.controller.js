import notificationModel from "../model/notification.model.js"


export const getUnreadNotification = async (request, response) => {
    try {
        const userId = request.userId

        const notifications = await notificationModel.find({ recipient: userId, isRead: false }).sort({ createdAt: -1 }).limit(10)
        const count = await notificationModel.countDocuments({ recipient: userId, isRead: false });

        return response.json({
            message: "Got all unread notification",
            notifications: notifications,
            count: count,
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