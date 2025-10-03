import notificationModel from "../model/notification.model.js"


export const getUnreadMessage = async (request, response) => {
    try {
        const userId = request.userId

        const notifications = await notificationModel.find({ recipient: userId, isRead: false }).sort({ createdAt: -1 }).limit(10)
        const count = await notificationModel.countDocuments({ recipient: userId, isRead: false });

        return response.json({
            message: "Got all unread notification",
            notifications: notifications,
            count: count,
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