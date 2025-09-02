import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { conversationModel, messageModel } from '../model/chat.model.js'
import userModel from '../model/user.model.js'
dotenv.config()



const app = express()
const server = createServer(app)

const io = new Server(server, {
    cors: {
        credentials: true,
        origin: process.env.FRONTENT_URL
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

        const conversation = await conversationModel.findById(conversationId)

        const isMemberOfGroup = conversation.participants.some(c => c.toString() === senderId.toString())

        if(!isMemberOfGroup){
            return socket.emit("send_message_error",{message : "You are not a member in this group anymore."})
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

                console.log("isadmin",isAdmin)

                if (isAdmin) {
                    group.admin = group.admin.filter(c => c.toString() !== my_id.toString())
                }

                group.participants = group.participants.filter(c => c.toString() !== my_id.toString())

                console.log("group",group)
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