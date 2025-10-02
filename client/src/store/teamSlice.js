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

            if (teamId !== state._id) return

            const filterData = state.member.filter((m) => m.userId !== memberId)
            state.member = filterData
        },
        addOfTeamMember: (state, action) => {
            const { teamId, newMember } = action.payload

            if (teamId !== state._id) return

            const isAlready = state.member.some((m) => m.userId === newMember.userId)
            if (!isAlready) {
                state.member = [newMember, ...state.member]
            }
        },
        teamRequestSendInfo: (state, action) => {
            const { teamId, data } = action.payload

            if (teamId !== state._id) return

            const isAlready = state.request_send.some((m) => m.sendTo_userId === data.sendTo_userId)

            if (!isAlready) {
                state.request_send.push(data)
            }
        },
        requestWithDraw: (state, action) => {
            const { memberId, teamId } = action.payload

            if (state._id !== teamId) return
            state.request_send = state.request_send.filter((r) => r.sendTo_userId !== memberId)
        },
        leftTeamMember: (state, action) => {
            const { teamId, left_userId } = action.payload

            if(teamId !== state._id) return
            state.member = state.member.filter((m) => m.userId !== left_userId)
        },
    }
})

export const { setTeamDetails, setTeamLogOut, updateTeamDetails,
    updateTeamForPromoteDemote, removeFromTeam,
    addOfTeamMember, teamRequestSendInfo, requestWithDraw,
    leftTeamMember
} = teamSlice.actions

export default teamSlice.reducer