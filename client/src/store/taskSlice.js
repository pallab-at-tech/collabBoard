import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    _id: "",
    teamId: "",
    name: "",
    column: []
}

const taskSlice = createSlice({
    name: 'task',
    initialState: initialValue,
    reducers: {
        setTask: (state, action) => {
            state._id = action.payload?._id
            state.teamId = action.payload?.teamId
            state.name = action.payload?.name
            state.column = action.payload?.column
        }
    }
})

export const { setTask } = taskSlice.actions
export default taskSlice.reducer