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

        await userModel.findByIdAndUpdate(
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

