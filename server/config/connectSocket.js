import express, { response } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import jwt from "jsonwebtoken"
import { conversationModel, messageModel } from '../model/chat.model.js'
import userModel from '../model/user.model.js'
import taskModel, { reportModel } from "../model/task.model.js"
import teamModel from '../model/team.model.js'
import crypto from 'crypto'
import inviteModel from '../model/invite.model.js'
import notificationModel from '../model/notification.model.js'
dotenv.config()



const app = express()
const server = createServer(app)

const io = new Server(server, {
    cors: {
        credentials: true,
        origin: process.env.FRONTENT_URL
    }
})

io.use((socket, next) => {

    const token = socket.handshake.auth?.token

    console.log("Token userd", token)

    if (!token) {
        return next(new Error("Not authenticated")); // reject connection
    }

    try {

        const payload = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)
        socket.userId = payload.id
        next()

    } catch (error) {
        return next(new Error("Not authenticated")); // reject connection
    }
})


const onlineUser = new Map()

io.on("connection", async (socket) => {

    // socket.emit("receive_message", { message: { text: "Test message from server" } });


    // join in a room and online
    socket.on("join_room", (userId) => {

        socket.join(userId.toString())
        onlineUser.set(socket.id, userId.toString());

        io.emit("online_user", Array.from(new Set(onlineUser.values())))

        console.log("User connected:", `${socket.id} -- ${userId}`);
    })


    // Message related controller start from here ...

    // change user details like name and profile picture
    socket.on("change_userDetails", async (data) => {
        try {
            const { name, image } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!name) {
                return socket.emit("userDeatails_error", {
                    message: "Name required!"
                })
            }

            const user = await userModel.findByIdAndUpdate(userId,
                {
                    name: name,
                    avatar: image
                },
                { new: true }
            )

            socket.emit("user_updateSuccess", {
                message: "Details successfully updated.",
                name: user.name,
                avatar: user.avatar
            })

        } catch (error) {
            console.log("Error while change user details.", error)
            socket.emit("error", { message: "Server error while change user details.", error: true })
        }
    })

    // send message privatly
    socket.on("send_message", async (data) => {
        try {
            const { senderId, receiverId, text, image, video, other_fileUrl_or_external_link } = data;

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            let conversation = await conversationModel.findOne({
                group_type: "PRIVATE",
                participants: { $all: [senderId, receiverId], $size: 2 }
            });

            if (!conversation) {
                conversation = await conversationModel.create({
                    group_type: "PRIVATE",
                    participants: [senderId, receiverId],
                    messages: []
                })
            }

            const newMessage = await messageModel.create({
                senderId: senderId,
                recieverId: receiverId,
                text: text,
                image: image,
                video: video,
                other_fileUrl_or_external_link: other_fileUrl_or_external_link,
                readBy: [senderId]
            })

            conversation.messages.push(newMessage._id)
            await conversation.save()


            const otherUserId = conversation.participants.find(
                (pId) => pId.toString() !== senderId.toString()
            )

            const otherUser = await userModel.findById(otherUserId)
                .select("_id name avatar email userId")
                .lean();

            const conversationToEmit = {
                _id: conversation._id,
                group_type: conversation.group_type,
                participants: conversation.participants,
                messages: conversation.messages,
                otherUser
            };

            const populatedMessage = await messageModel.findById(newMessage._id)
                .populate("senderId", "_id name avatar userId")
                .lean();


            io.to(senderId.toString()).emit("receive_message", {
                conversation: conversationToEmit,
                message: populatedMessage,
            });

            io.to(receiverId.toString()).emit("receive_message", {
                conversation: conversationToEmit,
                message: populatedMessage,
            });

        } catch (error) {
            console.error("Error sending message:", error);
        }
    })

    // create group
    socket.on("create_group", async (data) => {
        try {

            const { createrId, participants = [], group_image, group_name, createrUserName } = data

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!createrId || !group_name) {
                return socket.emit("error", { message: "Missing required fields" });
            }

            const uniqueParticipants = Array.from(new Set([...participants, createrId]));

            const createGroup = await conversationModel.create({
                group_type: "GROUP",
                group_name: group_name,
                group_image: group_image,
                participants: uniqueParticipants,
                admin: [createrId],
                messages: []
            })

            const systemMessage = await messageModel.create({
                senderId: createrId,
                text: `Group "${group_name}" created by ${createrUserName}`,
                readBy: [createrId]
            })

            createGroup.messages.push(systemMessage._id)
            await createGroup.save()

            const populateMessage = await messageModel.findById(systemMessage._id).populate("senderId", "_id name avatar userId").lean()

            const conversationToEmit = {
                _id: createGroup._id,
                group_type: createGroup.group_type,
                group_name: createGroup.group_name,
                group_image: createGroup.group_image,
                participants: createGroup.participants,
                admin: createGroup.admin,
                messages: createGroup.messages
            }

            uniqueParticipants.forEach(async (pid) => {

                io.to(pid.toString()).emit("receive_message", {
                    conversation: conversationToEmit,
                    message: populateMessage
                })

                if (userId.toString() !== pid?.toString()) {

                    const notification = await notificationModel.create({
                        recipient: pid.toString(),
                        type: "CHAT RELATED",
                        content: `You have been joined "${createGroup.group_name}" by "${createrUserName}"`,
                        navigation_link: `/chat/${createGroup._id}`
                    })

                    io.to(pid.toString()).emit("notify", {
                        _id: notification._id,
                        recipient: pid.toString(),
                        type: "CHAT RELATED",
                        content: `You have been joined "${createGroup.group_name}" by "${createrUserName}"`,
                        navigation_link: `/chat/${createGroup._id}`,
                        isRead: false
                    })
                }

            })

        } catch (error) {
            console.log("Error from creating group", error)
            socket.emit("error", { message: "Server error while creating group" });
        }
    })

    // send message for group
    socket.on("send_message_group", async (data) => {

        const { senderId, conversationId, text, image, video, other_fileUrl_or_external_link, senderUserId, senderName } = data

        const token = socket.handshake.auth?.token;
        if (!token) {
            return socket.emit("session_expired", { message: "No token found. Please login again." });
        }

        let payload1;
        try {
            payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        } catch (err) {
            return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
        }

        const userId1 = payload1.id;

        const conversation = await conversationModel.findById(conversationId)

        const isMemberOfGroup = conversation.participants.some(c => c.toString() === senderId.toString())

        if (!isMemberOfGroup) {
            return socket.emit("send_message_error", { message: "You are not a member in this group anymore." })
        }

        const newMessage = await messageModel.create({
            senderId: senderId,
            text: text,
            image: image,
            video: video,
            other_fileUrl_or_external_link: other_fileUrl_or_external_link,
            readBy: [senderId],
            senderName: senderName
        })

        conversation.messages.push(newMessage._id)

        conversation.save()

        const otherUserId = conversation.participants.find(
            (pId) => pId.toString() !== senderId.toString()
        )

        const otherUser = await userModel.findById(otherUserId)
            .select("_id name avatar email userId")
            .lean();


        const conversationToEmit = {
            _id: conversation._id,
            group_type: conversation.group_type,
            participants: conversation.participants,
            messages: conversation.messages,
            group_image: conversation.group_image,
            group_name: conversation.group_name
        };

        const populatedMessage = await messageModel.findById(newMessage._id)
            .populate("senderId", "_id name avatar userId")
            .lean();


        conversation.participants.forEach(pid => {
            io.to(pid.toString()).emit("receive_message", {
                conversation: conversationToEmit,
                message: populatedMessage
            })
        })

    })

    // update group details like group photo , group name
    socket.on("update_group_details", async (data) => {

        try {
            const { group_id, userId, userName, group_image, group_name } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!group_id || !userId) {
                return socket.emit("error", { message: "Missing required fields" });
            }

            const group = await conversationModel.findById(group_id)

            const isAdmin = group.admin.some(a => a.toString() === userId.toString())

            if (!isAdmin) {
                return socket.emit("update_error", { message: "Access denied", error: true })
            }

            let optional_msg = ""

            if (group_image) {
                group.group_image = group_image;
                optional_msg = `Group image changed by ${userName}`;
            } else if (group_name) {
                group.group_name = group_name;
                optional_msg = `Group name changed by ${userName}`;
            }

            if (optional_msg) {
                const newMessage = await messageModel.create({
                    senderId: userId,
                    optional_msg: optional_msg,
                    readBy: [userId]
                })

                group.messages.push(newMessage._id)
                await group.save()

                const conversationToEmit = {
                    _id: group._id,
                    group_type: group.group_type,
                    participants: group.participants,
                    messages: group.messages,
                    group_name: group.group_name,
                    group_image: group.group_image
                }

                const populatedMessage = await messageModel.findById(newMessage._id)
                    .populate("senderId", "_id name avatar userId")
                    .lean();

                group.participants.forEach(async (pid) => {
                    io.to(pid.toString()).emit("receive_message", {
                        conversation: conversationToEmit,
                        message: populatedMessage
                    })

                    if (pid.toString() !== userId1.toString()) {

                        const notification = await notificationModel.create({
                            recipient: pid.toString(),
                            type: "CHAT RELATED",
                            content: `"${group.group_name}" group details just updated`,
                            navigation_link: `/chat/${group._id}`
                        })

                        io.to(pid.toString()).emit("notify", {
                            _id: notification._id,
                            recipient: pid.toString(),
                            type: "CHAT RELATED",
                            content: `"${group.group_name}" group details just updated`,
                            navigation_link: `/chat/${group._id}`,
                            isRead: false
                        })
                    }
                })
            }

        } catch (error) {
            console.log("Error while update group details", error)
            socket.emit("error", { message: "Server error while update group details", error: true });
        }

    })

    // add member in group by admin , manually
    socket.on("add_member_chatGroup", async (data) => {
        try {

            const { group_id, memberId, memberUserId, adminUserId, adminId, memberAvatar, memberEmail, memberName } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!group_id || !memberId || !adminId) {
                return socket.emit("error", { message: "Missing required fields" });
            }

            const group = await conversationModel.findById(group_id)

            if (!group) {
                return socket.emit("member_error", { message: "Group not found", error: true });
            }

            const isAdmin = group.admin.some((c) => c.toString() === adminId.toString())

            if (!isAdmin) {
                return socket.emit("member_error", { message: "Access denied", error: true })
            }

            const isAlreadyPresent = group.participants.some((c) => c.toString() === memberId.toString())

            if (isAlreadyPresent) {
                return socket.emit("member_error", { message: "User already present in group", error: true })
            }

            group.participants.push(memberId)

            const newMessage = await messageModel.create({
                optional_msg: `@${memberUserId} is added in group by @${adminUserId}`,
                readBy: [adminId],
                senderId: adminId
            })

            group.messages.push(newMessage._id)

            await group.save()

            const conversationToEmit = {
                _id: group._id,
                group_type: group.group_type,
                participants: group.participants,
                messages: group.messages,
                group_name: group.group_name,
                group_image: group.group_image
            }

            const populatedMessage = await messageModel.findById(newMessage._id)
                .populate("senderId", "_id name avatar userId")
                .lean();

            group.participants.forEach(pid => {
                io.to(pid.toString()).emit("receive_message", {
                    conversation: conversationToEmit,
                    message: populatedMessage
                })
                io.to(pid.toString()).emit("member_added", {
                    group_id,
                    removedMemberId: memberId,
                    removedBy: adminId,
                    obj: {
                        _id: memberId,
                        name: memberName,
                        email: memberEmail,
                        userId: memberUserId,
                        avatar: memberAvatar
                    }
                })
            })

            const notification = await notificationModel.create({
                recipient: memberId,
                type: "CHAT RELATED",
                content: `You have been joined group "${group.group_name}" by "${adminUserId}"`,
                navigation_link: `/chat/${group._id}`
            })

            io.to(memberId.toString()).emit("notify", {
                _id: notification._id,
                recipient: memberId,
                type: "CHAT RELATED",
                content: `You have been joined group "${group.group_name}" by "${adminUserId}"`,
                navigation_link: `/chat/${group._id}`,
                isRead: false
            })

        } catch (error) {
            console.log("Error while add member in group", error)
            socket.emit("error", { message: "Server error while add member in group", error: true });
        }
    })

    // remove from group by admin
    socket.on("remove_member_chatGroup", async (data) => {
        try {

            const { group_id, memberId, memberUserId, adminUserId, adminId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!group_id || !memberId || !adminId) {
                return socket.emit("error", { message: "Missing required fields" });
            }

            const group = await conversationModel.findById(group_id)

            if (!group) {
                return socket.emit("memberRemove_error", { message: "Group not found", error: true });
            }

            const isAdmin = group.admin.some((c) => c.toString() === adminId.toString())

            if (!isAdmin) {
                return socket.emit("memberRemove_error", { message: "Access denied", error: true })
            }

            const isAlreadyPresent = group.participants.some((c) => c.toString() === memberId.toString())

            if (!isAlreadyPresent) {
                return socket.emit("memberRemove_error", { message: "Internal error occurs", error: true })
            }

            if (group.admin.length === 1 && group.admin[0].toString() === memberId.toString()) {
                return socket.emit("memberRemove_error", { message: "Cannot remove the last admin", error: true })
            }

            group.participants = group.participants.filter((id) => id.toString() !== memberId.toString())
            group.admin = group.admin.filter((id) => id.toString() !== memberId.toString())

            const newMessage = await messageModel.create({
                optional_msg: `@${memberUserId} is removed from group by @${adminUserId}`,
                readBy: [adminId],
                senderId: adminId
            })

            group.messages.push(newMessage._id)

            await group.save()

            const conversationToEmit = {
                _id: group._id,
                group_type: group.group_type,
                participants: group.participants,
                messages: group.messages,
                group_name: group.group_name,
                group_image: group.group_image
            }

            const populatedMessage = await messageModel.findById(newMessage._id)
                .populate("senderId", "_id name avatar userId")
                .lean();

            group.participants.forEach(pid => {
                io.to(pid.toString()).emit("receive_message", {
                    conversation: conversationToEmit,
                    message: populatedMessage
                })

                io.to(pid.toString()).emit("member_removed", {
                    group_id,
                    removedMemberId: memberId,
                    removedBy: adminId
                })
            })

            io.to(memberId.toString()).emit("removed_from_group", {
                group_id,
                removedBy: adminId,
                message: populatedMessage
            })

            const notification = await notificationModel.create({
                recipient: memberId,
                type: "CHAT RELATED",
                content: `You have been removed from group "${group.group_name}" by "${adminUserId}"`,
                navigation_link: `/chat/${group._id}`
            })

            io.to(memberId.toString()).emit("notify", {
                _id: notification._id,
                recipient: memberId,
                type: "CHAT RELATED",
                content: `You have been removed from group "${group.group_name}" by "${adminUserId}"`,
                navigation_link: `/chat/${group._id}`,
                isRead: false
            })

        } catch (error) {
            console.log("Error while remove member in group", error)
            socket.emit("error", { message: "Server error while remove member in group", error: true });
        }
    })

    // make group admin
    socket.on("make_admin", async (data) => {
        try {
            const { group_id, member_id, member_userId, my_id, my_userId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!member_id || !group_id || !my_id) {
                return socket.emit("error", { message: "Missing required fields" });
            }

            const group = await conversationModel.findById(group_id)

            if (!group) {
                return socket.emit("admin_error", { message: "Group is not exist." })
            }

            const isAdmin = group.admin.some(c => c.toString() === my_id.toString())
            if (!isAdmin) {
                return socket.emit("admin_error", { message: "Access denied" })
            }

            const isPresentInGroup = group.participants.some(c => c.toString() === member_id.toString())
            if (!isPresentInGroup) {
                return socket.emit("admin_error", { message: "User not present in group." })
            }

            if (!group.admin.some(c => c.toString() === member_id.toString())) {
                group.admin.push(member_id)
            }

            const newMessage = await messageModel.create({
                optional_msg: `${member_userId} are made group admin by ${my_userId}`,
                senderId: my_id,
                readBy: [my_id]
            })

            group.messages.push(newMessage._id)
            await group.save()

            const conversationToEmit = {
                _id: group._id,
                group_type: group.group_type,
                participants: group.participants,
                messages: group.messages,
                group_name: group.group_name,
                group_image: group.group_image
            }

            const populatedMessage = await messageModel.findById(newMessage._id)
                .populate("senderId", "_id name avatar userId")
                .lean();

            group.participants.forEach(pid => {
                io.to(pid.toString()).emit("receive_message", {
                    conversation: conversationToEmit,
                    message: populatedMessage
                })
            })

        } catch (error) {
            console.log("Error while make group admin", error)
            socket.emit("error", { message: "Server error while make group admin", error: true });
        }
    })

    // exit from group
    socket.on("exit_group", async (data) => {
        try {
            const { group_id, my_id, my_userId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!group_id || !my_id || !my_userId) {
                return socket.emit("error", { message: "Missing required fields" })
            }

            const group = await conversationModel.findById(group_id)

            if (!group) {
                return socket.emit("exit_group_error", { message: "Group is not exist.", error: true })
            }

            const onlyParticipant = group.participants.length === 1
            const onlyAdmin = group.admin.length === 1

            let notRequire = false

            if (onlyParticipant) {

                group.admin = []
                group.participants = []
                await group.save()
                const deleteConversation = await conversationModel.findByIdAndDelete(group_id)

                notRequire = true
            }
            else if (onlyAdmin) {

                const newAdmin = group.participants.find(c => c.toString() !== my_id.toString())
                group.admin = [newAdmin]

                group.participants = group.participants.filter(c => c.toString() !== my_id.toString())
            }
            else {

                const isAdmin = group.admin.some(c => c.toString() === my_id.toString())

                if (isAdmin) {
                    group.admin = group.admin.filter(c => c.toString() !== my_id.toString())
                }

                group.participants = group.participants.filter(c => c.toString() !== my_id.toString())

            }

            if (!notRequire) {

                const newMessage = await messageModel.create({
                    optional_msg: `${my_userId} left the group.`,
                    senderId: my_id,
                    readBy: [my_id]
                })

                group.messages.push(newMessage._id)
                await group.save()

                const conversationToEmit = {
                    _id: group._id,
                    group_type: group.group_type,
                    participants: group.participants,
                    messages: group.messages,
                    group_name: group.group_name,
                    group_image: group.group_image
                }

                const populatedMessage = await messageModel.findById(newMessage._id)
                    .populate("senderId", "_id name avatar userId")
                    .lean();

                group.participants.forEach(pid => {
                    io.to(pid.toString()).emit("receive_message", {
                        conversation: conversationToEmit,
                        message: populatedMessage
                    })

                    io.to(pid.toString()).emit("member_removed", {
                        group_id,
                        removedMemberId: my_id,
                        removedBy: my_id
                    })
                })

                io.to(my_id.toString()).emit("removed_from_group", {
                    group_id,
                    removedBy: my_id,
                    message: populatedMessage
                })

            }

        } catch (error) {
            console.log("Error while extit from group.", error)
            socket.emit("error", { message: "Server error while extit from group.", error: true });
        }
    })

    // All task related controller start from here...

    // get task details
    socket.on("get_task_details", async (teamId) => {
        try {
            if (!teamId) {
                socket.emit("get_task_error", { message: "Team ID required" })
            }

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload;
            try {
                payload = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                // Token invalid or expired
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload.id;

            const data = await taskModel.findOne({ teamId: teamId })
            return socket.emit("task_details_recieved", { data: data })

        } catch (error) {
            console.log("Error while get task.", error)
            socket.emit("error", { message: "Server error while get task", error: true });
        }
    })

    // create task
    socket.on("create-task", async (data) => {
        try {

            const { userId, teamId, columnId, title, description, assignTo, status, aditional_link, dueDate, dueTime, labels, image, video } = data || {}


            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                // Token invalid or expired
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!title) {
                return socket.emit("create_task_error", { message: "Please provide title" })
            }

            if (!dueDate) {
                return socket.emit("create_task_error", { message: "Please provide deathLine" })
            }

            if (Array.isArray(assignTo) && assignTo.length === 0) {
                return socket.emit("create_task_error", { message: "You must assign task to your member." })
            }

            const user = await userModel.findById(userId)

            if (!user) {
                return socket.emit("create_task_error", { message: "User not found" })
            }

            const taskBoard = await taskModel.findOne({ teamId: teamId })

            if (!taskBoard) {
                return socket.emit("create_task_error", { message: "Task board not found for team" })
            }

            const hasPermission = user.roles.some(
                (role) => role.teamId.toString() === teamId && role.role !== "MEMBER"
            )

            if (!hasPermission) {
                return socket.emit("create_task_error", { message: "Permission denied" })
            }

            const column = taskBoard.column.id(columnId)

            if (!column) {
                return socket.emit("create_task_error", { message: "Column not found for task Board" })
            }

            const payload = {
                title,
                description,
                assignby: user?.userId,
                assignTo: assignTo,
                status,
                aditional_link,
                dueDate,
                dueTime,
                labels,
                image,
                video,
            }

            column.tasks.push(payload)
            await taskBoard.save()

            const newTask = column.tasks[column.tasks.length - 1]

            io.to(user._id.toString()).emit("task_create_success", { message: "Task created successfully" })


            if (Array.isArray(assignTo)) {

                const assignUser_id = await userModel.find(
                    { userId: { $in: assignTo } },
                    { _id: 1 }
                ).lean()

                assignUser_id.forEach(async (id) => {

                    io.to(id._id.toString()).emit(
                        "task_assigned", {
                        message: "New task assigned to you",
                        task: newTask,
                        columnId: columnId,
                        columnName: column.name,
                        taskBoardId: taskBoard._id
                    })

                    const notification = await notificationModel.create({
                        recipient: id._id.toString(),
                        type: "TASK ASSIGNED",
                        content: `In taskboard "${taskBoard.name}" , new task just assigned to you`,
                        navigation_link: `/board`
                    })

                    io.to(m.userId.toString()).emit("notify", {
                        _id: notification._id,
                        recipient: id._id.toString(),
                        type: "TASK ASSIGNED",
                        content: `In taskboard "${taskBoard.name}" , new task just assigned to you`,
                        navigation_link: `/board`,
                        isRead: false
                    })
                })
            }

            io.to(user._id.toString()).emit("task_assigned", {
                message: "New task assigned to you",
                task: newTask,
                columnId: columnId,
                columnName: column.name,
                taskBoardId: taskBoard._id
            })

        } catch (error) {
            console.log("Error while create task.", error)
            socket.emit("error", { message: "Server error while create task", error: true });
        }
    })

    // update task
    socket.on("update_task", async (data) => {
        try {

            const { userId, teamId, columnId, taskId, title, description, assignTo, status,
                aditional_link, dueDate, dueTime, labels, image, video } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!userId) {
                return socket.emit("task_update_error", { message: "User id missing." })
            }

            if (!teamId) {
                return socket.emit("task_update_error", { message: "Team id missing." })
            }

            if (!columnId) {
                return socket.emit("task_update_error", { message: "Column id missing." })
            }

            if (!taskId) {
                return socket.emit("task_update_error", { message: "Task id missing." })
            }

            const user = await userModel.findById(userId)

            if (!user) {
                return socket.emit("task_update_error", { message: "User not found." })
            }

            const hasPermission = user.roles.some((role) => role.teamId.toString() === teamId && role.role !== "MEMBER")

            if (!hasPermission) {
                return socket.emit("task_update_error", { message: "Permission denied." })
            }

            const taskBoard = await taskModel.findOne({ teamId: teamId })

            if (!taskBoard) {
                return socket.emit("task_update_error", { message: "Task board not found" })
            }

            const column = taskBoard.column.id(columnId)

            if (!column) {
                return socket.emit("task_update_error", { message: "Column not found for task Board" })
            }

            const task = column.tasks.id(taskId)

            if (!task) {
                return socket.emit("task_update_error", { message: "Task not found" })
            }

            const oldAssignTo = task.assignTo.map(String)
            const newAssignTo = Array.isArray(assignTo) ? assignTo.map(String) : oldAssignTo

            const addedUser = newAssignTo.filter((id) => !oldAssignTo.includes(id))
            const removeUser = oldAssignTo.filter((id) => !newAssignTo.includes(id))

            if (title && title !== undefined) task.title = title
            if (description && description !== undefined) task.description = description
            if (assignTo !== undefined) task.assignTo = newAssignTo || []
            if (status && status !== undefined) task.status = status
            if (aditional_link !== undefined) task.aditional_link = aditional_link
            if (dueDate && dueDate !== undefined) task.dueDate = dueDate
            if (dueTime !== undefined) task.dueTime = dueTime
            if (labels !== undefined) task.labels = labels || []
            if (image !== undefined) task.image = image || ""
            if (video !== undefined) task.video = video || ""


            await taskBoard.save()

            io.to(userId.toString()).emit("update_task_msg", {
                message: "Task successfully updated."
            })

            if (addedUser.length > 0) {
                const users = await userModel.find({ userId: { $in: addedUser } }, { _id: 1 }).lean()

                users.forEach((u) => {
                    io.to(u._id.toString()).emit("task_assigned", {
                        message: "You have been assigned to a task",
                        task: task,
                        columnId: columnId,
                        taskBoardId: taskBoard._id
                    })
                })
            }

            if (removeUser.length > 0) {
                const users = await userModel.find({ userId: { $in: removeUser } }, { _id: 1 }).lean()

                users.forEach((u) => {
                    io.to(u._id.toString()).emit("task_unassigned", {
                        message: `You have been unassigned from a task ( ${task.title} )`,
                        taskId,
                        columnId,
                        taskBoardId: taskBoard._id
                    })
                })

            }

            io.to(userId.toString()).emit("update_task_data", {
                message: "Updated task data",
                task: task,
                columnId: columnId,
                taskBoardId: taskBoard._id,
                taskId: taskId
            })

            const users = await userModel.find({ userId: { $in: task.assignTo } }, { _id: 1 }).lean()

            users.forEach((u) => {
                io.to(u._id.toString()).emit("update_task_data", {
                    message: "Updated task data",
                    task: task,
                    columnId: columnId,
                    taskBoardId: taskBoard._id,
                    taskId: taskId
                })
            })

        } catch (error) {
            console.log("Error while update task.", error)
            socket.emit("error", { message: "Server error while update task", error: true });
        }
    })

    // delete task
    socket.on("delete_task", async (data) => {
        try {
            const { userId, teamId, columnId, taskId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId1 = payload1.id;

            if (!userId) {
                return socket.emit("task_delete_error", { message: "User id missing." })
            }

            if (!teamId) {
                return socket.emit("task_delete_error", { message: "Team id missing." })
            }

            if (!columnId) {
                return socket.emit("task_delete_error", { message: "Column id missing." })
            }

            if (!taskId) {
                return socket.emit("task_delete_error", { message: "Task id missing." })
            }

            const user = await userModel.findById(userId)

            if (!user) {
                return socket.emit("task_delete_error", { message: "User not found" })
            }

            const hasPermission = user.roles.some((role) => role.teamId.toString() === teamId && role.role !== "MEMBER")

            if (!hasPermission) {
                return socket.emit("task_delete_error", { message: "Permission Denied" })
            }

            const taskBoard = await taskModel.findOne({ teamId: teamId })

            if (!taskBoard) {
                return socket.emit("task_delete_error", { message: "Task board not found" })
            }

            const column = taskBoard.column.id(columnId)

            if (!column) {
                return socket.emit("task_delete_error", { message: "Column not found" })
            }

            const task = column.tasks.id(taskId)

            if (!task) {
                return socket.emit("task_delete_error", { message: "Task not found." })
            }

            const users = await userModel.find({ userId: { $in: task.assignTo } }, { _id: 1 }).lean()

            task.deleteOne()
            await taskBoard.save()

            users.forEach((u) => {
                io.to(u._id.toString()).emit("task_delete_success", {
                    message: `Admin delete task. Title : ( ${task.title} )`,
                    taskId: taskId,
                    columnId: columnId,
                    taskBoardId: taskBoard._id
                })
            })

            io.to(user._id.toString()).emit("task_delete_msg", {
                message: "Task successfully deleted.",
                taskId: taskId,
                columnId: columnId,
                taskBoardId: taskBoard._id
            })

        } catch (error) {
            console.log("Error while delete task.", error)
            socket.emit("error", { message: "Server error while delete task", error: true });
        }
    })

    // rename collabdesk name
    socket.on("collabDeskNameChange", async (data) => {
        try {
            const { deskId, teamId, newName } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("collabNameChange_error", { message: "Team Id required !" })
            }

            if (!deskId) {
                return socket.emit("collabNameChange_error", { message: "CollabDesk Id required !" })
            }

            const task = await taskModel.findById(deskId)

            if (!task) {
                return socket.emit("collabNameChange_error", { message: "Task not found !" })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("collabNameChange_error", { message: "Team not found !" })
            }

            const isAdmin = team.member.some((m) => m.userId.toString() === userId)

            if (!isAdmin) {
                return socket.emit("collabNameChange_error", { message: "Permission Denied." })
            }

            const oldname = task.name

            task.name = newName
            await task.save()

            team.member.forEach(async (m) => {
                io.to(m.userId.toString()).emit("collabName_success", {
                    newName: task.name,
                    message: "CollabDesk name successfully changed.",
                    taskBoardId: task._id
                })
                const notification = await notificationModel.create({
                    recipient: m.userId.toString(),
                    type: "TEAM UPDATE",
                    content: `CollabDesk name changed from "${oldname}" to "${task.name}" bt leader`,
                    navigation_link: "/board"
                })

                io.to(m.userId.toString()).emit("notify", {
                    _id: notification._id,
                    recipient: m.userId.toString(),
                    type: "TEAM UPDATE",
                    content: `CollabDesk name changed from "${oldname}" to "${task.name}" bt leader`,
                    navigation_link: "/board",
                    isRead: false
                })
            })


        } catch (error) {
            console.log("Error while collabDesk name change.", error)
            socket.emit("error", { message: "Server error collabDesk name change", error: true });
        }
    })

    // create taskDesk
    socket.on("createDesk", async (data) => {
        try {

            const { name, teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;


            if (!name) return socket.emit("createDeskError", { message: "Desk name required!" })
            if (!teamId) return socket.emit("createDeskError", { message: "Team Id required!" })

            const team = await teamModel.findById(teamId)

            if (!team) return socket.emit("Team not found!")

            const isTeamLeader = team.member.some((c) => c.userId.toString() === userId.toString() && c.role !== "MEMBER")

            if (!isTeamLeader) return socket.emit("createDeskError", { message: "Permission Denied!" })

            const desk = await taskModel.findOne({ teamId: teamId })

            if (desk) return socket.emit("createDeskError", { message: "Task Desk already exist." })

            const newDesk = await taskModel.create({
                teamId: teamId,
                name: name
            })

            await newDesk.save()

            team.member.forEach((m) => {
                io.to(m.userId.toString()).emit("createDeskSuccess", {
                    message: "CollabDesk Created successfully",
                    teamId: team._id
                })
            })

        } catch (error) {
            console.log("Error while collabDesk create.", error)
            socket.emit("error", { message: "Server error while create collabDesk", error: true });
        }
    })

    // delete task desk
    socket.on("DeskDelete", async (data) => {
        try {

            const { deskId, teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("DeskDelete_error", { message: "Team Id required!" })
            }

            if (!deskId) {
                return socket.emit("DeskDelete_error", { message: "CollabDesk Id required!" })
            }

            const task = await taskModel.findById(deskId)

            if (!task) {
                return socket.emit("DeskDelete_error", { message: "CollabDesk not found!" })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("DeskDelete_error", { message: "Team not found!" })
            }

            const isAdmin = team.member.some((m) => m.userId.toString() === userId.toString() && m.role !== "MEMBER")

            if (!isAdmin) {
                return socket.emit("DeskDelete_error", { message: "Permission Denied." })
            }

            const hasTasks = task.column.some((c) => c.tasks.length > 0);
            if (hasTasks) {
                return socket.emit("DeskDelete_error", { message: "Cannot delete a CollabDesk that still has tasks." });
            }

            await taskModel.findByIdAndDelete(deskId)

            team.member.forEach((m) => {
                io.to(m.userId.toString()).emit("DeskDelete_success", {
                    message: "CollabDesk deleted successfully.",
                    deskId: deskId
                })
            })


        } catch (error) {
            console.log("Error while collabDesk delete.", error)
            socket.emit("error", { message: "Server error collabDesk delete", error: true });
        }
    })

    // submit report of task
    socket.on("report-submit", async (data) => {

        try {
            const { teamId, columnId, taskId, userName, text, image, video, links } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("reportError", {
                    message: "Team Id required"
                })
            }

            if (!columnId) {
                return socket.emit("reportError", {
                    message: "Column Id required"
                })
            }

            if (!taskId) {
                return socket.emit("reportError", {
                    message: "Task Id required"
                })
            }

            if (!userName) {
                return socket.emit("reportError", {
                    message: "User Name required."
                })
            }

            if (!text) {
                return socket.emit("reportError", {
                    message: "Text missing!"
                })
            }

            const taskBoard = await taskModel.findOne({ teamId: teamId })

            if (!taskBoard) {
                return socket.emit("reportError", {
                    message: "TaskBoard not found"
                })
            }

            const column = taskBoard.column.id(columnId)

            if (!column) {
                return socket.emit("reportError", {
                    message: "Column not found"
                })
            }

            const task = column.tasks.id(taskId)

            if (!task) {
                return socket.emit("reportError", {
                    message: "Task not found."
                })
            }

            const isAssignedTask = task.assignTo.some((u) => u.toString() === userName.toString())

            if (!isAssignedTask) {
                return socket.emit("reportError", {
                    message: "Illegal Access"
                })
            }

            const isReportSubmiAlready = column.reportSubmit.some((u) => u.taskId.toString() === taskId.toString())

            if (isReportSubmiAlready) {
                return socket.emit("reportError", {
                    message: "Report already submitted"
                })
            }

            const now = new Date();
            const today = now.toISOString().split("T")[0]; // "2025-09-18" format
            const taskDate = new Date(task.dueDate).toISOString().split("T")[0];

            if (taskDate < today) {
                return socket.emit("reportError", {
                    message: "Deadline passed out, contact with team leader"
                });
            }
            else if (taskDate === today) {
                // Same day
                const dueTime = task.dueTime || "23:59";
                const dueDateTime = new Date(`${task.dueDate}T${dueTime}:00`);

                if (now > dueDateTime) {
                    return socket.emit("reportError", {
                        message: "Deadline time passed out, contact with team leader"
                    });
                }
            }

            // create report model
            const report = await reportModel.create({
                text: text,
                submitBy: userId,
                submitByUserId: userName,
                image: image || "",
                video: video || "",
                aditional_link: links || []
            })

            column.reportSubmit.push({
                taskId: taskId,
                report_id: report._id
            })

            await taskBoard.save()

            const team = await teamModel.findById(teamId)

            team.member.forEach((m) => {
                io.to(m.userId.toString()).emit("report-submitted", {
                    message: "Report submitted successfully",
                    deskId: taskBoard._id,
                    reportData: report
                })
            })

            const users = await userModel.find(
                { userId: { $in: task.assignTo } },
                { _id: 1 }
            )

            users.forEach((m) => {
                io.to(m._id.toString()).emit("report-submitted", {
                    message: "Report submitted successfully",
                    deskId: taskBoard._id,
                    reportData: report
                })
            })

            // send team laaders notifications
            team.member.forEach(async (l) => {

                if (l.role.toString() !== "MEMBER" && l.userId.toString() !== userId) {

                    const notification = await notificationModel.create({
                        recipient: l.userId.toString(),
                        type: "TASK COMPLETED",
                        content: `${userName} submitted task report from collabDesk name : "${taskBoard.name} , column name : "${column.name}" and assigned task : ${task.title} `,
                        navigation_link: `/board/${l.userName}-${l.userId}/${team._id}`
                    })

                    io.to(l.userId.toString()).emit("notify", {
                        _id: notification._id,
                        recipient: l.userId.toString(),
                        type: "TASK COMPLETED",
                        content: `${userName} submitted task report from collabDesk name : "${taskBoard.name} , column name : "${column.name}" and assigned task : ${task.title} `,
                        navigation_link: `/board/${l.userName}-${l.userId}/${team._id}`,
                        isRead: false
                    })
                }

            })

        } catch (error) {
            console.log("Error while submit report.", error)
            socket.emit("error", { message: "Server error while submit report", error: true })
        }

    })

    // update report
    socket.on("update-report", async (data) => {
        try {
            const { teamId, columnId, taskId, reportId, userName, text, image, video, aditional_link = [] } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("reportSubmitError", {
                    message: "Team Id required"
                })
            }

            if (!columnId) {
                return socket.emit("reportSubmitError", {
                    message: "Column Id required"
                })
            }

            if (!taskId) {
                return socket.emit("reportSubmitError", {
                    message: "Task Id required"
                })
            }

            if (!reportId) {
                return socket.emit("reportSubmitError", {
                    message: "Report Id required"
                })
            }

            if (!userName) {
                return socket.emit("reportSubmitError", {
                    message: "User Name required."
                })
            }

            const taskBoard = await taskModel.findOne({ teamId: teamId })

            if (!taskBoard) {
                return socket.emit("reportSubmitError", {
                    message: "TaskBoard not found"
                })
            }

            const column = taskBoard.column.id(columnId)

            if (!column) {
                return socket.emit("reportSubmitError", {
                    message: "Column not found"
                })
            }

            const task = column.tasks.id(taskId)

            if (!task) {
                return socket.emit("reportSubmitError", {
                    message: "Task not found."
                })
            }

            const isAssignedTask = task.assignTo.some((u) => u.toString() === userName.toString())

            if (!isAssignedTask) {
                return socket.emit("reportSubmitError", {
                    message: "Illegal Access"
                })
            }

            const now = new Date();
            const today = now.toISOString().split("T")[0]; // "2025-09-18" format
            const taskDate = new Date(task.dueDate).toISOString().split("T")[0];

            if (taskDate < today) {
                return socket.emit("reportSubmitError", {
                    message: "Deadline passed out, can't updated anymore."
                });
            }
            else if (taskDate === today) {
                // Same day
                const dueTime = task.dueTime || "23:59";
                const dueDateTime = new Date(`${task.dueDate}T${dueTime}:00`);

                if (now > dueDateTime) {
                    return socket.emit("reportSubmitError", {
                        message: "Deadline time passed out, can't updated anymore."
                    });
                }
            }

            const report = await reportModel.findByIdAndUpdate(reportId, {
                image: image,
                video: video,
                aditional_link: aditional_link,
                ...(text && { text: text })
            })

            io.to(userId.toString()).emit("report-updatted", {
                message: "Report update successfully",
                updateData: report
            })

            const team = await teamModel.findById(teamId)

            team.member.forEach(async (l) => {

                if (l.role.toString() !== "MEMBER" && l.userId.toString() !== userId) {

                    const notification = await notificationModel.create({
                        recipient: l.userId.toString(),
                        type: "TASK COMPLETED",
                        content: `Members just update it's submitted task report from collabDesk name : "${taskBoard.name} , column name : "${column.name}" and assigned task : ${task.title} `,
                        navigation_link: `/board/${l.userName}-${l.userId}/${team._id}`
                    })

                    io.to(l.userId.toString()).emit("notify", {
                        _id: notification._id,
                        recipient: l.userId.toString(),
                        type: "TASK COMPLETED",
                        content: `Members just update it's submitted task report from collabDesk name : "${taskBoard.name} , column name : "${column.name}" and assigned task : ${task.title} `,
                        navigation_link: `/board/${l.userName}-${l.userId}/${team._id}`,
                        isRead: false
                    })
                }
            })

        } catch (error) {
            console.log("Error while update report.", error)
            socket.emit("error", { message: "Server error while update report", error: true })
        }
    })

    // team details edit
    socket.on("updateTeamDetails", async (data) => {
        try {
            const { teamId, teamName, teamAbout } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("teamDetailsError", {
                    message: "Team id required."
                })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("teamDetailsError", {
                    message: "Team not found!"
                })
            }

            const isLeader = team.member.some((m) => m.userId.toString() === userId.toString() && m.role === "LEADER")

            if (!isLeader) {
                return socket.emit("teamDetailsError", {
                    message: "Access denied!"
                })
            }

            if (teamName) {
                team.name = teamName
            }

            team.description = teamAbout
            await team.save()

            team.member.forEach(async (m) => {
                io.to(m.userId.toString()).emit("teamDetails_updated", {
                    teamId: team._id,
                    name: team.name,
                    description: team.description,
                    message: "Team details updated"
                })
                if (userId.toString() !== m.userId.toString()) {

                    const notification = await notificationModel.create({
                        recipient: m.userId.toString(),
                        type: "TEAM UPDATE",
                        content: "Team details just updated",
                        navigation_link: `/board/${m.userName}-${m.userId}/${teamId}`
                    })

                    io.to(m.userId.toString()).emit("notify", {
                        _id: notification._id,
                        recipient: m.userId.toString(),
                        type: "TEAM UPDATE",
                        content: "Team details just updated",
                        navigation_link: `/board`,
                        isRead: false
                    })
                }
            })

        } catch (error) {
            console.log("Error while update team details by leader.", error)
            socket.emit("error", { message: "Server error while update team details by leader", error: true })
        }
    })

    // make admin of team
    socket.on("makeAdminOfTeam", async (data) => {
        try {
            const { memberId, teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!memberId) {
                return socket.emit("adminMakeError", {
                    message: "Member Id required!"
                })
            }

            if (!teamId) {
                return socket.emit("adminMakeError", {
                    message: "Team Id required!"
                })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("adminMakeError", {
                    message: "Team not found!"
                })
            }

            const isLeader = team.member.some((m) => m.userId.toString() === userId.toString() && m.role === "LEADER")

            if (!isLeader) {
                return socket.emit("adminMakeError", {
                    message: "Access denied!"
                })
            }

            const findTarget = team.member.find((m) => m.userId.toString() === memberId)

            if (!findTarget) {
                return socket.emit("adminMakeError", {
                    message: "Member not found!"
                })
            }

            if (findTarget.role === "LEADER") {
                return socket.emit("adminMakeError", {
                    message: "This member is already leader!"
                })
            }

            findTarget.role = "LEADER"

            const member = await userModel.findById(memberId)

            const targetMember = member.roles.find((m) => m.teamId.toString() === teamId)

            if (!targetMember) {
                return socket.emit("adminMakeError", {
                    message: "Member not found!"
                })
            }

            if (targetMember.role === "LEADER") {
                return socket.emit("adminMakeError", {
                    message: "This member is already leader!"
                })
            }

            targetMember.role = "LEADER"

            await member.save()
            await team.save()

            team.member.forEach((m) => {
                return io.to(m.userId.toString()).emit("adminSuccess", {
                    message: "Role promoted successfully",
                    teamId: teamId,
                    role: "LEADER",
                    memberId: memberId
                })
            })

            const notification = await notificationModel.create({
                recipient: memberId,
                type: "TEAM UPDATE",
                content: `Your role have been promoted to leader in team "${team.name}"`,
                navigation_link: `/board/${findTarget.userName}-${findTarget.userId}/${team._id}`
            })

            io.to(memberId.toString()).emit("notify", {
                _id: notification._id,
                recipient: memberId,
                type: "TEAM UPDATE",
                content: `Your role have been promoted to leader in team "${team.name}"`,
                navigation_link: `/board/${findTarget.userName}-${findTarget.userId}/${team._id}`,
                isRead: false
            })

        } catch (error) {
            console.log("Error while make admin of member of team.", error)
            socket.emit("error", { message: "Server error while make admin of member of team.", error: true })
        }
    })

    // make demote of leader
    socket.on("demoteOfMember", async (data) => {
        try {
            const { memberId, teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!memberId) {
                return socket.emit("demotedError", {
                    message: "Member Id required!"
                })
            }

            if (!teamId) {
                return socket.emit("demotedError", {
                    message: "Team Id required!"
                })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("demotedError", {
                    message: "Team not found!"
                })
            }

            const isLeader = team.member.some((m) => m.userId.toString() === userId.toString() && m.role === "LEADER")

            if (!isLeader) {
                return socket.emit("demotedError", {
                    message: "Access denied!"
                })
            }

            const findTarget = team.member.find((m) => m.userId.toString() === memberId)

            if (!findTarget) {
                return socket.emit("demotedError", {
                    message: "Member not found!"
                })
            }

            if (findTarget.role === "MEMBER") {
                return socket.emit("demotedError", {
                    message: "This member is already a normal member!"
                })
            }

            findTarget.role = "MEMBER"

            const member = await userModel.findById(memberId)

            const targetMember = member.roles.find((m) => m.teamId.toString() === teamId)

            if (!targetMember) {
                return socket.emit("demotedError", {
                    message: "Member not found!"
                })
            }

            if (targetMember.role === "MEMBER") {
                return socket.emit("demotedError", {
                    message: "This member is already a normal member!"
                })
            }

            targetMember.role = "MEMBER"

            await member.save()
            await team.save()

            team.member.forEach((m) => {
                return io.to(m.userId.toString()).emit("demoteSuccess", {
                    message: "Role demoted successfully",
                    teamId: teamId,
                    role: "MEMBER",
                    memberId: memberId
                })
            })

            const notification = await notificationModel.create({
                recipient: member._id,
                type: "TEAM UPDATE",
                content: `Your role have been demoted to member in team "${team.name}"`,
                navigation_link: `/board/${findTarget.userName}-${findTarget.userId}/${team._id}`
            })

            io.to(member._id.toString()).emit("notify", {
                _id: notification._id,
                recipient: member._id,
                type: "TEAM UPDATE",
                content: `Your role have been demoted to member in team "${team.name}"`,
                navigation_link: `/board/${findTarget.userName}-${findTarget.userId}/${team._id}`,
                isRead: false
            })

        } catch (error) {
            console.log("Error while make demote of member of team.", error)
            socket.emit("error", { message: "Server error while make demote of member of team.", error: true })
        }
    })

    // kick out from team
    socket.on("KickedOUtFromTeam", async (data) => {
        try {

            const { memberId, teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!memberId) {
                return socket.emit("kickedOutError", {
                    message: "Member Id required!"
                })
            }

            if (!teamId) {
                return socket.emit("kickedOutError", {
                    message: "Team Id required!"
                })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("kickedOutError", {
                    message: "Team not found!"
                })
            }

            const isLeader = team.member.some((m) => m.userId.toString() === userId.toString() && m.role === "LEADER")

            if (!isLeader) {
                return socket.emit("kickedOutError", {
                    message: "Access denied!"
                })
            }

            const filterMemberData = team.member.filter((m) => m.userId.toString() !== memberId)

            const user = await userModel.findById(memberId)

            if (!user) {
                return socket.emit("kickedOutError", {
                    message: "User not found!"
                })
            }
            const filterUserData = user.roles.filter((u) => u.teamId.toString() !== teamId)

            team.member = filterMemberData
            user.roles = filterUserData

            await team.save()
            await user.save()

            io.to(memberId).emit("kickOutSuccess", {
                message: `${user.userId} removed from the team by leader`,
                teamId: teamId,
                memberId: memberId,
                teamName: team.name
            })

            team.member.forEach((m) => {
                io.to(m.userId.toString()).emit("kickOutSuccess", {
                    message: `${user.userId} removed from the team by leader`,
                    teamId: teamId,
                    memberId: memberId,
                    teamName: team.name
                })
            })

            const notification = await notificationModel.create({
                recipient: memberId,
                type: "TEAM UPDATE",
                content: `You have been removed from the team "${team.name}"`,
                navigation_link: ""
            })

            io.to(memberId.toString()).emit("notify", {
                _id: notification._id,
                recipient: memberId,
                type: "TEAM UPDATE",
                content: `You have been removed from the team "${team.name}"`,
                navigation_link: "",
                isRead: false
            })

        } catch (error) {
            console.log("Error while kicked out from team.", error)
            socket.emit("error", { message: "Server error while kicked out from team", error: true })
        }
    })

    // generate team joining link by leader.
    socket.on("generate_team_link", async (data) => {
        try {

            const { teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("team_inviteError", {
                    message: "Team Id required."
                })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("team_inviteError", {
                    message: "Team not found!"
                })
            }

            const isLeader = team.member.some((m) => m.userId.toString() === userId.toString() && m.role === "LEADER")
            if (!isLeader) {
                return socket.emit("team_inviteError", {
                    message: "Access denied."
                })
            }

            // generate random token
            const inviteToken = crypto.randomBytes(12).toString('hex')

            const invite = await inviteModel.create({
                teamId: teamId,
                token: inviteToken
            })

            return socket.emit("invited_link", {
                message: "Invite code created successfully.",
                token: invite.token
            })
        } catch (error) {
            console.log("Error while creating team joining code.", error)
            socket.emit("error", { message: "Server error while creating team joining code.", error: true })
        }
    })

    // join team through invite code
    socket.on("join_team", async (data) => {
        try {

            const { invite_code } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!invite_code) {
                return socket.emit("join_teamError", {
                    message: "Invite code required!"
                })
            }

            const invite = await inviteModel.findOne({ token: invite_code })

            if (!invite) {
                return socket.emit("join_teamError", {
                    message: "Invite Code doesn't exist."
                })
            }

            if (invite.expireAt < new Date()) {
                return socket.emit("join_teamError", {
                    message: "Team code expired!"
                })
            }

            if (invite.usedCount >= invite.maxCount) {
                return socket.emit("join_teamError", {
                    message: "Invite link has reached maximum usage"
                })
            }

            const team = await teamModel.findById(invite.teamId)

            if (!team) {
                return socket.emit("join_teamError", {
                    message: "Team not found!"
                })
            }

            const alreadyMember = team.member.some((m) => m.userId.toString() === userId.toString())

            if (alreadyMember) {
                return socket.emit("join_teamError", {
                    message: `You are already a member of the team "${team.name}"`
                })
            }

            const user = await userModel.findById(userId)

            if (!user) {
                return socket.emit("join_teamError", {
                    message: "User doesn't exist!"
                })
            }

            const alreadyMemberFromUser = user.roles.some((m) => m.teamId.toString() === team._id.toString())

            if (alreadyMemberFromUser) {
                return socket.emit("join_teamError", {
                    message: `You are already a member of the team "${team.name}"`
                })
            }

            invite.usedCount += 1

            user.roles.push({
                teamId: team._id,
                name: team.name,
                organization_type: team.organization_type,
                role: "MEMBER"
            })

            team.member.push({
                userId: user._id,
                role: "MEMBER",
                userName: user.userId
            })

            await user.save()
            await team.save()
            await invite.save()

            io.to(userId.toString()).emit("join_teamSuccess", {

                message: `You are successfully the member of ${team.name}`,
                teamId: team._id,
                forUserState: {
                    teamId: team._id,
                    name: team.name,
                    organization_type: team.organization_type,
                    role: "MEMBER"
                }
            })

            team.member.forEach(async (m) => {

                if (m.userId.toString() !== userId.toString()) {

                    io.to(m.userId.toString()).emit("join_teamSuccess", {
                        message: `New member ( ${user.userId} ) just joined.`,
                        teamId: team._id,
                        newMember: {
                            userId: userId,
                            role: "MEMBER",
                            userName: user.userId,
                        }
                    })

                    if (m.role !== "MEMBER") {

                        const notification = await notificationModel.create({
                            recipient: m.userId,
                            type: "TEAM INVITE",
                            content: `New member ( ${user.userId} ) just joined through invite code.`,
                            navigation_link: `/board/${m.userName}-${m.userId}/${team._id}`
                        })

                        io.to(m.userId.toString()).emit("notify", {
                            _id: notification._id,
                            recipient: m.userId,
                            type: "TEAM INVITE",
                            content: `New member ( ${user.userId} ) just joined through invite code.`,
                            navigation_link: `/board/${m.userName}-${m.userId}/${team._id}`,
                            isRead: false
                        })
                    }
                }
            })

        } catch (error) {
            console.log("Error while joining team through team code.", error)
            socket.emit("error", { message: "Server error while joining team through team code.", error: true })
        }
    })

    // join team by direct invite
    socket.on("team_join", async (data) => {
        try {
            const { teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("team_joinError", {
                    message: "Team id required!"
                })
            }

            const user = await userModel.findById(userId)

            if (!user) {
                return socket.emit("team_joinError", {
                    message: "User not found!"
                })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("team_joinError", {
                    message: "Team not found!"
                })
            }

            const isRequestExist = user.request.some((is) => is.teamId.toString() === teamId.toString())

            if (!isRequestExist) {
                return socket.emit("team_joinError", {
                    message: "Request not found!"
                })
            }

            user.request = user.request.filter((m) => m.teamId.toString() !== teamId.toString())
            user.roles.push({
                teamId: teamId,
                name: team.name,
                organization_type: team.organization_type,
                role: "MEMBER"
            })

            await user.save()

            team.request_send = team.request_send.filter((m) => m.sendTo_userId.toString() !== userId.toString())

            team.member.push({
                userId: userId,
                userName: user.userId,
                role: "MEMBER"
            })

            await team.save()

            socket.emit("team_join_success", {
                message: `You are successfully the member of team "${team.name}"`,
                teamId: team._id,
                roleData: {
                    name: team.name,
                    organization_type: team.organization_type,
                    role: "MEMBER",
                    teamId: team._id,
                    _id: "N/A"
                }
            })

            team.member.forEach((m) => {

                if (m.userId.toString() !== userId.toString()) {

                    io.to(m.userId.toString()).emit("join_teamSuccess", {
                        message: `New member ( ${user.userId} ) just joined.`,
                        teamId: team._id,
                        newMember: {
                            userId: userId,
                            role: "MEMBER",
                            userName: user.userId,
                        }
                    })
                }
            })

        } catch (error) {
            console.log("Error while joining team through direct team leader request.", error)
            socket.emit("error", { message: "Server error while joining team through direct team leader request.", error: true })
        }
    })

    // send direct team request by leader
    socket.on("team_request", async (data) => {
        try {
            const { memberId, teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("team_requestError", {
                    message: "Team Id required!"
                })
            }

            if (!memberId) {
                return socket.emit("team_requestError", {
                    message: "User Id required!"
                })
            }

            const team = await teamModel.findById(teamId)

            if (!team) {
                return socket.emit("team_requestError", {
                    message: "Team not found!"
                })
            }

            const isTeamLeader = team.member.some((m) => m.userId.toString() === userId.toString() && m.role !== "MEMBER")

            if (!isTeamLeader) {
                return socket.emit("team_requestError", {
                    message: "Access denied!"
                })
            }

            const isUserAlreadyAvailable = team.member.some((m) => m.userId.toString() === memberId.toString())

            if (isUserAlreadyAvailable) {
                return socket.emit("team_requestError", {
                    message: "User already present in team"
                })
            }

            const isAlreadyRequestSend = team.request_send.some((m) => m.sendTo_userId.toString() === memberId.toString())

            if (isAlreadyRequestSend) {
                return socket.emit("team_requestError", {
                    message: "Request already sent!"
                })
            }

            const userLeader = await userModel.findById(userId)
            const userUpdate = await userModel.findById(memberId)

            userUpdate.request.push({
                teamId: teamId,
                teamName: team.name,
                requestedBy_id: userId,
                requestedBy_userId: userLeader.userId
            })

            await userUpdate.save()

            team.request_send.push({
                sendTo_userId: memberId,
                sendBy_userId: userId,

                sendTo_userName: userUpdate.userId,
                sendBy_userName: userLeader.userId
            })

            await team.save()

            io.to(memberId).emit("team_requestReceived", {
                message: `"${userLeader.userId}" send a team request.`,
                teamId: teamId,
                teamRequestData: {
                    teamId: teamId,
                    teamName: team.name,
                    requestedBy_id: userLeader._id,
                    requestedBy_userId: userUpdate.userId,
                    _id: "N/A"
                }
            })

            team.member.forEach((m) => {

                io.to(m.userId.toString()).emit("team_requsetSend", {

                    message: `Team request send to "${userUpdate.userId}"`,
                    teamId: teamId,
                    requestData: {
                        createdAt: new Date(),
                        sendBy_userId: userId,
                        sendBy_userName: userLeader.userId,
                        sendTo_userId: memberId,
                        sendTo_userName: userUpdate.userId,
                        updatedAt: new Date(),
                        _id: "N/A"
                    }
                })
            })

            const notification = await notificationModel.create({
                recipient: memberId,
                type: "TEAM INVITE",
                content: `You have team request from team "${team.name}"`,
                navigation_link: ``
            })

            io.to(memberId.toString()).emit("notify", {
                _id : notification._id,
                recipient: memberId,
                type: "TEAM INVITE",
                content: `You have team request from team "${team.name}"`,
                navigation_link: ``,
                isRead : false
            })

        } catch (error) {
            console.log("Error while sending team request.", error)
            socket.emit("error", { message: "Server error while sending team request.", error: true })
        }
    })

    // team request withdraw by leader
    socket.on("request_withdraw", async (data) => {
        try {
            const { memberId, teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("team_withDrawError", {
                    message: "Team Id required!"
                })
            }

            if (!memberId) {
                return socket.emit("team_withDrawError", {
                    message: "User Id required!"
                })
            }

            const team = await teamModel.findById(teamId)

            const isTeamLeader = team.member.some((m) => m.userId.toString() === userId.toString() && m.role !== "MEMBER")

            if (!isTeamLeader) {
                return socket.emit("team_withDrawError", {
                    message: "Access denied!"
                })
            }

            const isUserAlreadyAvailable = team.member.some((m) => m.userId.toString() === memberId.toString())

            if (isUserAlreadyAvailable) {
                return socket.emit("team_withDrawError", {
                    message: "User already present in team!"
                })
            }

            const user = await userModel.findById(memberId)

            team.request_send = team.request_send.filter((u) => u.sendTo_userId.toString() !== memberId.toString())

            await team.save()

            user.request = user.request.filter((u) => u.teamId.toString() !== teamId.toString())

            await user.save()

            io.to(memberId.toString()).emit("request_targetPulled", {
                message: `Pull out your team request from team "${team.name}"`,
                teamId: teamId
            })

            team.member.forEach((m) => {

                io.to(m.userId.toString()).emit("request_pulled", {
                    message: `Team requset withDraw from user "${user.userId}"`,
                    memberId: memberId,
                    teamId: teamId
                })
            })

        } catch (error) {
            console.log("Error while withdrawing team request.", error)
            socket.emit("error", { message: "Server error while withdrawing team request.", error: true })
        }
    })

    // team member exit
    socket.on("team_exit", async (data) => {
        try {

            const { teamId } = data || {}

            const token = socket.handshake.auth?.token;
            if (!token) {
                return socket.emit("session_expired", { message: "No token found. Please login again." });
            }

            let payload1;
            try {
                payload1 = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
            } catch (err) {
                return socket.emit("session_expired", { message: "Your session has expired. Please log in again." });
            }

            const userId = payload1.id;

            if (!teamId) {
                return socket.emit("exitError", {
                    message: "Team Id required!"
                })
            }

            // check is team member or not
            const user = await userModel.findById(userId)
            if (!user) {
                return socket.emit("exitError", {
                    message: "User not found!"
                })
            }

            const team = await teamModel.findById(teamId)
            if (!team) {
                return socket.emit("exitError", {
                    message: "Team not found!"
                })
            }

            const searchInUser = user.roles.some((u) => u.teamId.toString() === teamId.toString())
            const searchInTeam = team.member.some((u) => u.userId.toString() === userId.toString())

            if (!searchInTeam || !searchInUser) {
                return socket.emit("exitError", {
                    message: "Illegal access!"
                })
            }

            // check leader if then only leader in the team
            let leader_count = 0
            let isLeader = false
            team.member.forEach((m) => {

                if (m.role.toString() !== "MEMBER") {
                    leader_count += 1

                    if (m.userId.toString() === userId.toString()) {
                        isLeader = true
                    }
                }

            })

            let isTeamDelete = false

            if (isLeader) {

                if (leader_count === 1) {

                    if (team.member.length === 1) {
                        // exit group and delete team model
                        isTeamDelete = true
                        user.roles = user.roles.filter((u) => u.teamId.toString() !== teamId.toString())
                        await taskModel.deleteMany({ teamId: teamId })
                        await team.deleteOne()
                    }
                    else {
                        // exit group and make another member leader
                        user.roles = user.roles.filter((u) => u.teamId.toString() !== teamId.toString())
                        for (let m of team.member) {
                            if (m.userId.toString() !== userId.toString()) {
                                m.role = "LEADER"
                                break
                            }
                        }
                        team.member = team.member.filter((m) => m.userId.toString() !== userId.toString())
                    }
                }
                else {
                    // just exit the team
                    user.roles = user.roles.filter((u) => u.teamId.toString() !== teamId.toString())
                    team.member = team.member.filter((m) => m.userId.toString() !== userId.toString())
                }
            }
            else {
                // just exit the team
                user.roles = user.roles.filter((u) => u.teamId.toString() !== teamId.toString())
                team.member = team.member.filter((m) => m.userId.toString() !== userId.toString())
            }

            if (!isTeamDelete) {
                await team.save()
            }
            await user.save()

            if (isTeamDelete) {
                io.to(userId.toString()).emit("team_exited", {
                    message: "You have left the team successfully.",
                    teamId: teamId,
                    left_userId: userId
                })
            }
            else {
                io.to(userId.toString()).emit("team_exited", {
                    message: "You have left the team successfully.",
                    teamId: teamId,
                    left_userId: userId
                })

                team.member.forEach((m) => {
                    io.to(m.userId.toString()).emit("team_exited", {
                        message: `${user.userId} has left the team.`,
                        teamId: teamId,
                        left_userId: userId
                    })
                })
            }


        } catch (error) {
            console.log("Error while exit from team.", error)
            socket.emit("error", { message: "Server error while exit from team.", error: true })
        }
    })

    // disconnect from the room and offline
    socket.on("disconnect", () => {
        const userId = onlineUser.get(socket.id)

        if (userId) {
            onlineUser.delete(socket.id)
            io.emit("online_user", Array.from(new Set(onlineUser.values())))
        }

        console.log("User connected:", `${socket.id} -- ${userId}`);

    });
})

export { app, server, io }