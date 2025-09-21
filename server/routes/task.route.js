import express from 'express'
import { createColumnController, createTaskController, deleteColumnLabelController, fetchReportController, getTaskDetailsController, renameColumnLabelController, taskBoardCreateController } from '../controller/task.controller.js'
import auth from "../middleware/auth.js"

const taskRoute = express()

taskRoute.post("/create-taskBoard", auth, taskBoardCreateController)
taskRoute.get("/task-deatails", auth, getTaskDetailsController)
taskRoute.put("/create-column", auth, createColumnController)
taskRoute.post("/task-create", auth, createTaskController)
taskRoute.post("/task-column-rename", auth, renameColumnLabelController)
taskRoute.post("/task-delete", auth, deleteColumnLabelController)
taskRoute.get("/get-report", auth, fetchReportController)

export default taskRoute