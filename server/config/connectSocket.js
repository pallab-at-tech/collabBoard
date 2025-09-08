import express, { response } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import jwt from "jsonwebtoken"
import { conversationModel, messageModel } from '../model/chat.model.js'
import userModel from '../model/user.model.js'
import taskModel from "../model/task.model.js"
import teamModel from '../model/team.model.js'
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

            const userId1 = payload1.id;

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

            console.log("populateMessage", populateMessage)

            const conversationToEmit = {
                _id: createGroup._id,
                group_type: createGroup.group_type,
                group_name: createGroup.group_name,
                group_image: createGroup.group_image,
                participants: createGroup.participants,
                admin: createGroup.admin,
                messages: createGroup.messages
            }

            uniqueParticipants.forEach(pid => {
                io.to(pid.toString()).emit("receive_message", {
                    conversation: conversationToEmit,
                    message: populateMessage
                })
                io.to(pid.toString()).emit("notification", {
                    message: `you have been joined ${createGroup.group_name} by ${createrUserName}`
                })
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

                group.participants.forEach(pid => {
                    io.to(pid.toString()).emit("receive_message", {
                        conversation: conversationToEmit,
                        message: populatedMessage
                    })
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

                assignUser_id.forEach(id => {
                    io.to(id._id.toString()).emit(
                        "task_assigned", {
                        message: "New task assigned to you",
                        task: newTask,
                        columnId: columnId,
                        taskBoardId: taskBoard._id
                    })
                })
            }

            io.to(user._id.toString()).emit("task_assigned", {
                message: "New task assigned to you",
                task: newTask,
                columnId: columnId,
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

            task.name = newName
            await task.save()

            team.member.forEach((m => {
                io.to(m.userId.toString()).emit("collabName_success", {
                    newName: task.name,
                    message: "CollabDesk name successfully changed.",
                    taskBoardId: task._id
                })
            }))


        } catch (error) {
            console.log("Error while collabDesk name change.", error)
            socket.emit("error", { message: "Server error collabDesk name change", error: true });
        }
    })

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

            
            console.log("deskId",deskId,"  teamId",teamId,"  userId",userId)

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