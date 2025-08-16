import { conversationModel, messageModel } from "../model/chat.model.js"
import userModel from "../model/user.model.js"

export const getPreviousChatUsers = async (request, response) => {
    try {
        const userId = request.userId

        const conversation = await conversationModel
            .find({ participants: { $in: [userId] } })
            .sort({ updatedAt: -1 })
            .populate({
                path: "participants",
                select: "_id name avatar email userId"
            })
            .lean();

        if (Array.isArray(conversation) && conversation.length === 0) {
            return response.status(400).json({
                message: 'No conversation Available',
                error: true,
                success: false
            })
        }

        const mergedData = conversation.map(conv => {
            const otherUser = conv.participants.find(
                p => p._id.toString() !== userId.toString()
            );
            return {
                ...conv,
                otherUser,
                participants : conv.participants
            };
        });

        console.log("mergedData mergedData mergedData",mergedData)


        return response.json({
            message: 'Get all participants details',
            data: mergedData,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}

export const fetchAllMessages = async (request, response) => {
    try {

        const { allMessageId = [] } = request.body || {}

        if (!Array.isArray(allMessageId) || allMessageId.length === 0) {
            return response.status(400).json({
                message: "Don't have any messages",
                error: true,
                success: false
            })
        }

        const messages = await messageModel.find(
            { _id: { $in: allMessageId } }
        ).sort({ createdAt: 1 }).lean()

        return response.json({
            message: 'all messages get',
            data: messages,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}