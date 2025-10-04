import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    data: [],
    count : 0
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
        }
    }
})

export const { setNotification, fillWithNotification } = notificationSlice.actions
export default notificationSlice.reducer