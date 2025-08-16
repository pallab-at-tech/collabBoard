// Axios.js
import axios from 'axios'
import SummaryApi, { baseURL } from '../common/SummaryApi'
import { setLoginGlobal } from '../provider/GlobalProvider'

const Axios = axios.create({
    baseURL: baseURL,
    withCredentials: true
})

// Add access token
Axios.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem("accesstoken")
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Handle token expiration
Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        let originalRequest = error.config

        if (error?.response?.status === 401 && !originalRequest?.retry) {
            originalRequest.retry = true
            const refreshToken = localStorage.getItem("refreshToken")

            if (refreshToken) {
                const newAccessToken = await refreshAccessToken(refreshToken)

                if (newAccessToken) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                    return Axios(originalRequest)
                }

                // refresh failed → logout
                localStorage.clear()
                localStorage.setItem("login", "false")
                setLoginGlobal(false)   //  update context
                window.location.href = "/login"
            } else {
                localStorage.setItem("login", "false")
                setLoginGlobal(false)   //  update context
            }
        }

        return Promise.reject(error)
    }
)

const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await Axios({
            ...SummaryApi.refreshToken,
            headers: { Authorization: `Bearer ${refreshToken}` }
        })

        const accessToken = response.data.data.accessToken
        localStorage.setItem('accesstoken', accessToken)
        localStorage.setItem("login", "true")
        setLoginGlobal(true)  
        return accessToken
    } catch (error) {
        console.log(error)
    }
}

export default Axios
