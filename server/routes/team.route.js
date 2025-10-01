import express from 'express'
import { teamCreateController , getTeamDetailsController, teamSearchController } from '../controller/team.controller.js'
import auth from '../middleware/auth.js'

const teamRouter = express()

teamRouter.post("/team-create",auth, teamCreateController)
teamRouter.get("/team-details",auth, getTeamDetailsController)
teamRouter.get("/members-query",auth,teamSearchController)

export default teamRouter