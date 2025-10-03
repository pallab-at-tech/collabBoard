import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    data: []
}

const notificationSlice = createSlice({
    name: "notification",
    initialState: initialValue,
    reducers: {
        fillWithNotification: (state, action) => {
            const { value } = action.payload
            state.data = [value, ...state.data]
        }
    }
})

export const { fillWithNotification } = notificationSlice.actions
export default notificationSlice.reducer