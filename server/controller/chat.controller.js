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
                participants: conv.participants
            };
        });

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

export const getConversationDetails = async (request, response) => {
    try {

        const userId = request?.userId
        const { conversationID } = request.query || {}

        if (!conversationID) {
            return response.status(400).json({
                message: "conversation ID required",
                success: false,
                error: true
            })
        }

        const details = await conversationModel
            .findById(conversationID)
            .select("-messages")
            .populate({
                path: "participants",
                select: "_id name userId avatar"
            })
            .lean();

        // participants with admin flag
        const participants = details.participants.map(p => ({
            _id: p._id,
            name: p.name,
            userId: p.userId,
            avatar: p.avatar,
            admin: details.admin.some(a => a.toString() === p._id.toString())
        }));

        const currUser = participants.find(p => p._id.toString() === userId.toString());
        const otherUser = participants.filter(p => p._id.toString() !== userId.toString());

        const orderedParticipants = currUser
            ? [currUser, ...otherUser]
            : participants;

        const data = {
            _id: details._id,
            group_type: details.group_type,
            group_name: details.group_name,
            group_image: details.group_image,
            createdAt: details.createdAt,
            updatedAt: details.updatedAt,
            participants: orderedParticipants,
            currUser,
            otherUser
        };

        return response.json({
            message: "Group details",
            data: data,
            currUser: currUser,
            success: true,
            error: false,
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}