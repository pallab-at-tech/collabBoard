import taskModel, { reportModel } from "../model/task.model.js"
import userModel from "../model/user.model.js"
import teamModel from "../model/team.model.js"

export const taskBoardCreateController = async (request, response) => {
    try {

        const { teamId, name } = request.body || {}

        if (!name) {
            return response.status(400).json({
                message: 'Task tittle required',
                error: true,
                success: false
            })
        }

        if (!teamId) {
            return response.status(400).json({
                message: 'Team Id required',
                error: true,
                success: false
            })
        }

        const isAlreadyTaskBoardExist = await taskModel.findOne({ teamId: teamId })

        if (isAlreadyTaskBoardExist) {
            return response.status(400).json({
                message: 'task already exist',
                error: true,
                success: false
            })
        }

        const payload = {
            teamId,
            name,
        }

        const createTaskBoard = new taskModel(payload)
        const save = createTaskBoard.save()

        return response.json({
            message: 'Task board create successfully',
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

export const getTaskDetailsController = async (request, response) => {
    try {
        const { teamId } = request.query || {}
        const userId = request.userId

        if (!teamId) {
            return response.status(400).json({
                message: 'Team ID required',
                error: true,
                success: false
            })
        }

        const [team, user, data] = await Promise.all([
            teamModel.findById(teamId),
            userModel.findById(userId),
            taskModel.findOne({ teamId: teamId })
        ])

        if (!team) {
            return response.status(400).json({
                message: "Team not found",
                error: true,
                success: false
            })
        }

        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        const userName = user.userId
        const isLeader = team.member.some(c => c.userId.toString() === userId && c.role.toString() !== "MEMBER")

        if (!isLeader && data !== null) {

            const filterData = {
                _id: data._id,
                teamId: data.teamId,
                name: data.name,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                column: data.column.map(c => {
                    const userTask = c.tasks.filter(t => t.assignTo.includes(userName))
                    return userTask.length ? { ...c.toObject?.() || c, tasks: userTask } : null
                }).filter(Boolean) || []
            }

            return response.json({
                message: 'Get task details',
                data: filterData,
                error: false,
                success: true
            })
        } else {
            return response.json({
                message: 'Get task details',
                data: data,
                error: false,
                success: true
            })
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const createColumnController = async (request, response) => {
    try {

        const { teamId, name } = request.body || {}
        const userId = request.userId

        if (!teamId) {
            return response.status(400).json({
                message: 'team ID required',
                error: true,
                success: false
            })
        }

        if (!name) {
            return response.status(400).json({
                message: 'name required',
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(userId)

        const isPermission = true

        {
            user.roles.map((elem) => {
                if (elem.teamId === teamId && elem.role !== "LEADER") {
                    isPermission = false
                }
            })
        }

        if (!isPermission) {
            return response.status(400).json({
                message: 'Permission denied',
                error: true,
                success: false
            })
        }

        const payload = {
            name: name,
            tasks: []
        }

        await taskModel.findOneAndUpdate({ teamId: teamId },
            {
                $push: {
                    column: payload
                }
            }
        )

        return response.json({
            message: 'New column created',
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

export const createTaskController = async (request, response) => {
    try {

        const userId = request.userId

        const { teamId, columnId, title, description, assignTo, status, aditional_link, dueDate, dueTime, labels, image, video } = request.body || {}

        if (!title) {
            return response.status(400).json({
                message: 'please provide title',
                error: true,
                success: false
            })
        }

        if (!dueDate) {
            return response.status(400).json({
                message: 'please provide deathLine',
                error: true,
                success: false
            })
        }

        const [user, taskBoard] = await Promise.all([
            userModel.findById(userId),
            taskModel.findOne({ teamId: teamId })
        ])

        if (!user) {
            return response.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            });
        }

        if (!taskBoard) {
            return response.status(404).json({
                message: 'Task board not found for team',
                error: true,
                success: false
            });
        }

        let hasPermission = false;

        user.roles.forEach((role) => {
            if (role.teamId.toString() === teamId && role.role !== "MEMBER") {
                hasPermission = true;
            }
        });


        if (!hasPermission) {
            return response.status(400).json({
                message: 'Permission denied',
                error: true,
                success: false
            })
        }

        const column = taskBoard.column.id(columnId)

        if (!column) {
            return response.status(404).json({
                message: 'column not found for task Board',
                error: true,
                success: false
            });
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

        return response.json({
            message: 'Task created successfully',
            success: true,
            error: false
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const renameColumnLabelController = async (request, response) => {
    try {

        const userId = request.userId
        const { columnId, taskId, columnName, teamId } = request.body || {}

        const user = await userModel.findById(userId).select("roles")

        let isLeader = false

        user.roles?.forEach((v) => {

            if (v.teamId.toString() === teamId && v.role !== "MEMBER") {
                isLeader = true
            }
        })

        if (!isLeader) {
            return response.status(400).json({
                message: "Permission denied",
                error: true,
                success: false
            })
        }

        if (!columnName || !columnName.trim()) {
            return response.status(400).json({
                message: "New column name required",
                error: true,
                success: false
            });
        }

        if (!columnId) {
            return response.status(400).json({
                message: "column Id required",
                error: true,
                success: false
            })
        }

        const task = await taskModel.findOneAndUpdate(
            { _id: taskId, "column._id": columnId },
            { $set: { "column.$.name": columnName } }
        )

        if (!task) {
            return response.status(400).json({
                message: "Task not found !",
                error: true,
                success: false
            })
        }

        return response.json({
            message: "Column renamed successfully",
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

export const deleteColumnLabelController = async (request, response) => {
    try {

        const userId = request.userId

        const { columnId, taskId, teamId } = request.body || {}

        const user = await userModel.findById(userId).select("roles")

        let isLeader = false

        user.roles?.forEach((v) => {

            if (v.teamId.toString() === teamId && v.role !== "MEMBER") {
                isLeader = true
            }
        })

        if (!isLeader) {
            return response.status(400).json({
                message: "Permission denied",
                error: true,
                success: false
            })
        }


        if (!taskId) {
            return response.status(400).json({
                message: "Task Id required",
                error: true,
                success: false
            })
        }

        if (!columnId) {
            return response.status(400).json({
                message: "Column Id required",
                error: true,
                success: false
            })
        }

        const task = await taskModel.findById(taskId)

        if (!task) {
            return response.status(400).json({
                message: "Task not found !",
                error: true,
                success: false
            })
        }

        const column = task.column.id(columnId)

        if (!column) {
            return response.status(400).json({
                message: "Column not found !",
                error: true,
                success: false
            })
        }

        if (column.tasks.length !== 0) {
            return response.status(400).json({
                message: "Cannot delete column that contains tasks!",
                error: true,
                success: false
            });
        }

        await taskModel.findByIdAndUpdate(
            taskId,
            {
                $pull: { column: { _id: columnId } }
            }
        )

        return response.json({
            message: "Column delete successfully",
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

export const fetchReportController = async (request, response) => {

    try {

        const { reportId } = request.query || {}

        if (!reportId) {
            return response.status(400).json({
                message: "Report id required",
                error: true,
                success: false
            })
        }

        const report = await reportModel.findById(reportId)

        return response.json({
            message: "get report",
            report: report,
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