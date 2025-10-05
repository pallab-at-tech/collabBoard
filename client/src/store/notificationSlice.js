import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    data: [],
    count: 0
}

const notificationSlice = createSlice({
    name: "notification",
    initialState: initialValue,
    reducers: {
        setNotification: (state, action) => {
            state.data = action.payload?.data || []
            state.count = action.payload?.count
        },
        fillWithNotification: (state, action) => {
            const { value } = action.payload
            state.data = [value, ...state.data]
            state.count = state.count + 1
        },
        setEmptyAllNotification: (state, action) => {
            state.data = []
            state.count = 0
        },
        updateNotification: (state, action) => {
            const { notify_id } = action.payload
            state.data = state.data.filter((d) => d?._id !== notify_id)
            state.count = state.data.length
        }
    }
})

export const { setNotification, fillWithNotification, setEmptyAllNotification , updateNotification } = notificationSlice.actions
export default notificationSlice.reducer