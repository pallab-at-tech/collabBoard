import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    _id: "",
    name: "",
    description: "",
    organization_type: "",
    member: [],
    request_send: []
}

const teamSlice = createSlice({
    name: "team",
    initialState: initialValue,
    reducers: {
        setTeamDetails: (state, action) => {
            state._id = action.payload?._id
            state.name = action.payload?.name
            state.description = action.payload?.description
            state.organization_type = action.payload?.organization_type
            state.member = [...action.payload?.member]
            state.request_send = [...action.payload?.request_send]
        },
        setTeamLogOut: (state, action) => {
            state._id = ""
            state.name = ""
            state.description = ""
            state.organization_type = ""
            state.member = []
            state.request_send = []
        },
        updateTeamDetails: (state, action) => {
            const { name, description } = action.payload

            if (name !== undefined) {
                state.name = name
            }
            if (description !== undefined) {
                state.description = description
            }

        }
    }
})

export const { setTeamDetails, setTeamLogOut, updateTeamDetails } = teamSlice.actions
export default teamSlice.reducer