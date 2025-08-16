import SummaryApi from "../common/SummaryApi"
import Axios from "./Axios"

const fetchUserDetails = async () =>{
    try {
        const response = await Axios({
            ...SummaryApi.user_deatails
        })

        return response.data

    } catch (error) {
        console.log("fetch error",error)
    }
}

export default fetchUserDetails