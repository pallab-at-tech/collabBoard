import express from 'express'
import { teamCreateController , getTeamDetailsController, teamSearchController, addMemberByLeaderController, withdrawRequestMemberByLeaderController } from '../controller/team.controller.js'
import auth from '../middleware/auth.js'

const teamRouter = express()

teamRouter.post("/team-create",auth, teamCreateController)
teamRouter.get("/team-details",auth, getTeamDetailsController)
teamRouter.get("/members-query",auth,teamSearchController)
teamRouter.post("/add-member",auth,addMemberByLeaderController)
teamRouter.post("/request-withdraw-by-leader",auth,withdrawRequestMemberByLeaderController)

export default teamRouter