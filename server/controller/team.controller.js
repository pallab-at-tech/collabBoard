import mongoose from "mongoose";
import teamModel from "../model/team.model.js";
import userModel from "../model/user.model.js";

export const teamCreateController = async (request, response) => {
    try {
        const userId = request.userId

        const { name, role = "LEADER", description, organization_type } = request.body || {}

        if (!name) {
            return response.status(400).json({
                message: "Please provide team name",
                error: true,
                success: false
            })
        }

        if (!organization_type) {
            return response.status(400).json({
                message: "Please provide organization type",
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(userId)

        const payload = {
            name,
            description,
            organization_type,
            member: [
                {
                    userId,
                    role,
                    userName: user.userId
                }
            ]
        }

        const Team = new teamModel(payload)

        const save = await Team.save()


        const userDataUpdate = await userModel.findByIdAndUpdate(
            userId,
            {
                $push: {
                    roles: {
                        teamId: save._id,
                        role: role,
                        name: name,
                        organization_type: organization_type
                    }
                }
            }
        )

        return response.json({
            message: 'team create successfully',
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

export const addMemberByLeaderController = async (request, response) => {
    try {

        const leaderId = request.userId
        const { userId, teamId } = request.body || {}

        if (!teamId) {
            return response.status(400).json({
                message: 'team ID required',
                error: true,
                success: false
            })
        }

        if (!userId) {
            return response.status(400).json({
                message: 'user ID required',
                error: true,
                success: false
            })
        }

        const team = await teamModel.findById(teamId)

        if (!team) {
            return response.status(400).json({
                message: 'Team is not exist',
                error: true,
                success: false
            })
        }

        const isTeamLeader = team.member.some((m) => m.userId.toString() === leaderId?.toString() && m.role !== "MEMBER")

        if (!isTeamLeader) {
            return response.status(400).json({
                message: "you haven't the access to add member",
                error: true,
                success: false
            })
        }

        const isUserAlreadyAvailable = team.member.some((m) => m.userId.toString() === userId.toString())

        if (isUserAlreadyAvailable) {
            return response.status(400).json({
                message: "User already present in team",
                error: true,
                success: false
            })
        }

        const userLeader = await userModel.findById(leaderId)

        const userUpdate = await userModel.findById(userId)

        userUpdate.request.push({
            teamId: teamId,
            teamName: team.name,
            requestedBy_id: leaderId,
            requestedBy_userId: userLeader.userId
        })

        await userUpdate.save()

        team.request_send.push({
            sendTo_userId: userId,
            sendBy_userId: leaderId,

            sendTo_userName: userUpdate.userId,
            sendBy_userName: userLeader.userId
        })

        await team.save()

        // userLeader.send.push({
        //     teamId: teamId,
        //     teamName: team.name,
        //     requestSendTo_id: userId,
        //     requestSendTo_userId: userUpdate.userId
        // })

        // await userLeader.save()


        return response.json({
            message: `request sent to ${userUpdate.userId}`,
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

export const withdrawRequestMemberByLeaderController = async (request, response) => {
    try {

        const leaderId = request.userId
        const { userId, teamId } = request.body || {}

        if (!userId) {
            return response.status(400).json({
                message: 'provide userId',
                error: true,
                success: false
            })
        }

        if (!teamId) {
            return response.status(400).json({
                message: 'provide teamId',
                error: true,
                success: false
            })
        }

        const leader = await userModel.findById(leaderId)
        const user = await userModel.findById(userId)

        const team = await teamModel.findById(teamId)

        const isTeamLeader = team.member.some((m) => m.userId.toString() === leaderId?.toString() && m.role !== "MEMBER")

        if (!isTeamLeader) {
            return response.status(400).json({
                message: "you haven't the access to this action",
                error: true,
                success: false
            })
        }

        const isUserAlreadyAvailable = team.member.some((m) => m.userId.toString() === userId.toString())

        if (isUserAlreadyAvailable) {
            return response.status(400).json({
                message: "User already present in team",
                error: true,
                success: false
            })
        }


        // leader.send.pull({
        //     teamId : teamId,
        //     teamName : team.name,
        //     requestSendTo_id : userId,
        //     requestSendTo_userId : user.userId
        // })

        // leader.save()

        //  sendTo_userId : userId,
        // sendBy_userId : leaderId,

        // sendTo_userName :userUpdate.userId,
        // sendBy_userName : userLeader.userId

        team.request_send.pull({
            sendTo_userId : userId,
            sendBy_userId : leaderId,

            sendTo_userName : user.userId,
            sendBy_userName : leader.userId
        })

        team.save()

        user.request.pull({
            teamId: teamId,
            teamName: team.name,
            requestedBy_id: leaderId,
            requestedBy_userId: leader.userId
        })

        user.save()

        return response.json({
            message: `request successfully withdraw from ${user.userId}`,
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

export const getTeamDetailsController = async (request, response) => {
    try {

        const { teamId } = request.query || {}

        if (!teamId) {
            return response.status(400).json({
                message: 'Team Id required',
                error: true,
                success: false
            })
        }

        const teamDetails = await teamModel.findById(teamId)

        return response.json({
            message: 'Got team details',
            data: teamDetails,
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

export const teamSearchController = async (request, response) => {
    try {

        const { searchItem, teamId } = request.query || {}

        if (!searchItem) {
            return response.status(400).json({
                message: 'Missing serch Item',
                error: true,
                success: false
            })
        }

        const result = await teamModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(teamId)
                }
            },
            {
                $project: {
                    member: {
                        $filter: {
                            input: "$member",
                            as: 'm',
                            cond: {
                                $regexMatch: {
                                    input: "$$m.userName",
                                    regex: searchItem,
                                    options: "i"
                                }
                            }
                        }
                    }
                }
            }
        ])


        const matchedMembers = result[0]?.member || [];

        if (matchedMembers.length === 0) {
            return response.status(404).json({
                message: "No matching members found",
                error: true,
                success: false,
            });
        }


        return response.json({
            message: 'All result of query',
            error: false,
            success: true,
            query: result
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

