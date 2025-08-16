import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

async function auth(request, response, next) {

    try {

        const token = request.cookies.accesstoken || request?.headers?.authorization?.split(" ")[1]

        if (!token) {
            return response.status(400).json({
                message: "you haven't login yet"
            })
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if (!decode) {
            return response.status(400).json({
                message: 'unauthorized access',
                error: true,
                success: false
            })
        }

        request.userId = decode.id

        next()

    } catch (error) {
        return response.status(500).json({
            message: "you haven't login yet",
            error: true,
            success: false
        })
    }
}

export default auth