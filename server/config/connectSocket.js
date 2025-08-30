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

    socket.on("update_group_details", async (data) => {

        try {
            const { group_id, userId, userName, group_image, group_name } = data || {}

            if (!group_id || !userId) {
                return socket.emit("error", { message: "Missing required fields" });
            }

            const group = await conversationModel.findById(group_id)

            const isAdmin = group.admin.some(a => a.toString() === userId.toString())

            if (!isAdmin) {
                return socket.emit("update_error", { message: "Access denied" , error : true })
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
            socket.emit("error", { message: "Server error while update group details" , error : true });
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