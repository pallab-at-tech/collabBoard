import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 4)


import userModel from "../model/user.model.js"
import generatedAccessToken from '../utils/generateAccessToken.js'
import generateRefreshToken from '../utils/generateRefreshToken.js'
import generateOTP from '../utils/generateOTP.js'
import sendEmail from '../utils/sendEmail.js'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import teamModel from '../model/team.model.js'


export const userRegisterController = async (request, response) => {
    try {

        const { name, email, password } = request.body || {}
        const uniqueId = nanoid()

        if (!name || !email || !password) {
            return response.status(400).json({
                message: 'please provide name , email and password',
                error: true,
                success: false
            })
        }

        const user = await userModel.findOne({ email: email })

        if (user) {
            return response.status(400).json({
                message: `user already registered with your provided email`,
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)
        const num = Math.floor(100000 + Math.random() * 900000)

        const payload = {
            name,
            email,
            password: hashPassword,
            verify_code: num,
            userId: name.split(" ")[0] + `-${uniqueId}`
        }

        const newUser = new userModel(payload)
        const save = await newUser.save()


        const verify_email = await sendEmail({
            sendTO: email,
            subject: 'email verfication from collabBoard',
            html: verifyEmailTemplate({
                name,
                code: num
            })
        })

        return response.json({
            message: 'user register successfully',
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

export const userLoginController = async (request, response) => {
    try {
        const { email, password } = request.body || {}

        if (!email || !password) {
            return response.status(400).json({
                message: 'please provide email and password',
                error: true,
                success: false
            })
        }

        const user = await userModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: `provide email not registered`,
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return response.status(400).json({
                message: "please enter right password",
                error: true,
                success: false
            })
        }

        // refreshToken and accessToken 
        const accessToken = await generatedAccessToken(user._id)
        const refreshToken = await generateRefreshToken(user._id)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accesstoken', accessToken, cookiesOption);
        response.cookie('refreshToken', refreshToken, cookiesOption);


        return response.json({

            message: "Login succesfully",
            error: false,
            success: true,
            data: {
                accessToken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const userEmailVerificationController = async (request, response) => {
    try {

        const { email, code } = request.body || {}

        if (!code) {
            return response.status(400).json({
                message: "verification code required",
                error: true,
                success: false
            })
        }

        const user = await userModel.findOne({ email: email })

        if (code !== user.verify_code) {

            return response.status(400).json({
                message: "Invalid code",
                error: true,
                success: false
            })
        }

        const userUpdate = await userModel.findByIdAndUpdate(user?._id, {
            verify_email: true,
            verify_code: ""
        })

        return response.json({
            message: 'email verify successfully',
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

export const userLogOutController = async (request, response) => {
    try {

        const userId = request.userId

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        }

        response.clearCookie('accesstoken', cookiesOption)
        response.clearCookie('refreshToken', cookiesOption)

        const removeRefresh = await userModel.findByIdAndUpdate(userId, {
            refresh_token: ""
        })

        return response.json({
            message: 'Logout successfully',
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

export const userForgotPassword = async (request, response) => {
    try {

        const { email } = request.body || {}

        if (!email) {
            return response.status(400).json({
                message: 'please provide your email',
                error: true,
                success: false
            })
        }

        const user = await userModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: 'Provide email not registered',
                error: true,
                success: false
            })
        }

        const otp = (await generateOTP()).toString()
        const oneHourLater = new Date(new Date().getTime() + 60 * 60 * 1000);

        const update = await userModel.findByIdAndUpdate(user._id, {
            forgot_Password_otp: otp,
            forgot_Password_expiry: oneHourLater
        })

        // await sendEmail({
        //     sendTO: email,
        //     subject: 'Reset password , from Quizzy buddy',
        //     html: sendOtpTemplate({
        //         name: user.name,
        //         otp: otp
        //     })
        // })

        return response.json({
            message: 'otp send to your gmail',
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

export const userVerifyForgotPasswordController = async (request, response) => {
    try {

        const { email, otp } = request.body || {}

        if (!otp) {
            return response.status(400).json({
                message: 'Required otp',
                error: true,
                success: false
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return response.status(400).json({
                message: 'Provide email not registered',
                error: true,
                success: false
            })
        }

        const currTime = new Date()

        if (currTime > user?.forgot_Password_expiry) {
            return response.status(400).json({
                message: 'otp expired',
                error: true,
                success: false
            })
        }

        if (otp !== user.forgot_Password_otp) {
            return response.json({
                message: 'invalid otp',
                error: true,
                success: false
            })
        }

        const updateUser = await userModel.findByIdAndUpdate(user?._id, {
            forgot_Password_expiry: "",
            forgot_Password_otp: ""
        })

        return response.json({
            message: "Verify otp successfully",
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

export const userRefressingTokenController = async (request, response) => {
    try {
        const tokenFromcookie = request?.cookies?.refreshToken
        const tokenFromHeader = request?.headers?.authorization?.split(" ")[1]

        const refreshToken = tokenFromcookie || tokenFromHeader

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESSH_TOKEN)

        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }

        const userId = verifyToken?.id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        response.cookie('accesstoken', newAccessToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const userDetailsController = async (request, response) => {
    try {

        const userId = request.userId
        const userData = await userModel.findById(userId).select("-password -refresh_token -forgot_Password_otp -forgot_Password_expiry -verify_code")

        return response.json({
            message: 'user Details',
            data: userData,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}

export const userSearchController = async (request, response) => {
    try {
        const { searchTerm } = request.query || {}

        if (!searchTerm) {
            return response.status(400).json({
                message: 'Provide userId or name',
                error: true,
                success: false
            })
        }

        const query = searchTerm ? {
            $text: {
                $search: searchTerm
            }
        } : {}

        const result = await userModel.find(
            query
        ).select("_id name userId avatar roles")


        if (!Array.isArray(result) || result.length === 0) {
            return response.status(400).json({
                message: "Result not found",
                error: true,
                success: false
            })
        }

        return response.json({
            message: "user list",
            error: false,
            success: true,
            result: result
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}

export const updateUserDetailsController = async (request, response) => {
    try {

        const userId = request.userId
        const { name, about, avatar } = request.body || {}

        console.log("about", about)

        const upadateUser = await userModel.findByIdAndUpdate(
            userId,
            {
                ...(name && { name: name }),
                ...(about && { about: about }),
                ...(avatar && { avatar: avatar })
            }
        )

        return response.json({
            message: 'Update successfully',
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}

export const userRequestConfirmController = async (request, response) => {
    try {
        const userId = request.userId
        const { teamId, teamName, requestedBy_id, requestedBy_userId } = request.body || {}

        if (!teamId) {
            return response.status(400).json({
                message: 'team Id required',
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(userId)

        if (!user) {
            return response.status(400).json({
                message: 'User not found !',
                error: true,
                success: false
            })
        }

        const team = await teamModel.findById(teamId)

        if (!team) {
            return response.status(400).json({
                message: 'Team not found !',
                error: true,
                success: false
            })
        }

        user.request.pull({
            teamId: teamId,
            teamName: teamName,
            requestedBy_id: requestedBy_id,
            requestedBy_userId: requestedBy_userId
        })

        user.roles.push({
            teamId: teamId,
            name: team.name,
            organization_type: team.organization_type,
            role: "MEMBER"
        })

        await user.save()

        team.request_send.pull({
            sendTo_userId: userId,
            sendTo_userName: user.userId,
            sendBy_userId: requestedBy_id,
            sendBy_userName: requestedBy_userId
        })

        team.member.push({
            userId: userId,
            userName: user.userId,
            role: "MEMBER"
        })

        await team.save()

        return response.json({
            message: `you are now the member of ${team.name}`,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}

export const userRequestCancelController = async (request, response) => {
    try {

        const userId = request.userId
        const { teamId, teamName, requestedBy_id, requestedBy_userId } = request.body || {}

        if (!teamId) {
            return response.status(400).json({
                message: 'team Id required',
                error: true,
                success: false
            })
        }

        const user = await userModel.findById(userId)

        if (!user) {
            return response.status(400).json({
                message: 'User not found !',
                error: true,
                success: false
            })
        }

        const team = await teamModel.findById(teamId)

        if (!team) {
            return response.status(400).json({
                message: 'Team not found !',
                error: true,
                success: false
            })
        }

        user.request.pull({
            teamId: teamId,
            teamName: teamName,
            requestedBy_id: requestedBy_id,
            requestedBy_userId: requestedBy_userId
        })

        await user.save()

        team.request_send.pull({
            sendTo_userId: userId,
            sendTo_userName: user.userId,
            sendBy_userId: requestedBy_id,
            sendBy_userName: requestedBy_userId
        })

        await team.save()

        return response.json({
            message : "request pull out successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        })
    }
}