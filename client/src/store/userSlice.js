import { createSlice } from '@reduxjs/toolkit'

const initialValue = {
    _id: "",
    name: "",
    email: "",
    roles: [],
    avatar: "",
    verify_email: false,
    request: [],
    userId: "",
    about: "",
    onlineUser: []
}

const userSlice = createSlice({
    name: 'user',
    initialState: initialValue,
    reducers: {
        setUserDetails: (state, action) => {
            state._id = action.payload?._id
            state.name = action.payload?.name
            state.email = action.payload?.email
            state.roles = [...action.payload?.roles]
            state.avatar = action.payload?.avatar
            state.verify_email = action.payload?.verify_email
            state.request = action.payload?.request
            state.userId = action.payload?.userId
            state.about = action.payload?.about
        },
        onlineUserDetails: (state, action) => {
            state.onlineUser = action.payload?.onlineUser
        },
        setUserLogout: (state, action) => {
            state._id = ""
            state.name = ""
            state.email = ""
            state.roles = []
            state.avatar = ""
            state.verify_email = false
            state.request = []
            state.userId = ""
            state.about = ""
            state.onlineUser = []
        },
        currUserteamDetailsUpdate: (state, action) => {
            const { teamId, memberId } = action.payload

            console.log("state update user",state._id === memberId)
            if(state._id === memberId){
                const filterData = state.roles.filter((m) => m.teamId !== teamId)
                state.roles = filterData
            }
        }
    }
})

export const { setUserDetails, setUserLogout, onlineUserDetails, currUserteamDetailsUpdate } = userSlice.actions
export default userSlice.reducer