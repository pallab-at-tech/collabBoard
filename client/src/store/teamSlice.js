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
        },
        updateTeamForPromoteDemote: (state, action) => {
            const { teamId, role, memberId } = action.payload

            if (teamId !== state._id) return

            const targetIdx = state.member.findIndex((m) => m?.userId === memberId)
            if (targetIdx !== -1) {
                state.member[targetIdx].role = role
            }
        },
        removeFromTeam: (state, action) => {
            const { teamId, memberId } = action.payload

            if(teamId !== state._id) return

            const filterData = state.member.filter((m) => m.userId !== memberId)
            // console.log("setRemoveLoading",filterData)
            state.member = filterData
        }
    }
})

export const { setTeamDetails, setTeamLogOut, updateTeamDetails, updateTeamForPromoteDemote, removeFromTeam } = teamSlice.actions
export default teamSlice.reducer