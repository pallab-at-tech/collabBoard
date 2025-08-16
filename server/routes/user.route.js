import express from 'express'
import { updateUserDetailsController, userDetailsController, userEmailVerificationController, userForgotPassword, userLoginController, userLogOutController, userRefressingTokenController, userRegisterController, userRequestCancelController, userRequestConfirmController, userSearchController, userVerifyForgotPasswordController } from '../controller/user.controller.js'
import auth from '../middleware/auth.js'


const userRoute = express()

userRoute.post("/register",userRegisterController)
userRoute.post("/login",userLoginController)
userRoute.put("/verify-email",userEmailVerificationController)
userRoute.get("/logout",auth, userLogOutController)
userRoute.put("/forgot-password",userForgotPassword)
userRoute.put("/verify-forgot-password",userVerifyForgotPasswordController)
userRoute.post("/refresh-token",userRefressingTokenController)
userRoute.get("/user-details",auth,userDetailsController)
userRoute.get("/user-search",auth,userSearchController)
userRoute.post("/user-update",auth,updateUserDetailsController)
userRoute.post("/request-reject",auth,userRequestCancelController)
userRoute.post("/request-accept",auth,userRequestConfirmController)

export default userRoute