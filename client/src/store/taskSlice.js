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
        },
        updateColumn: (state, action) => {
            const { task, columnId } = action.payload
            const columnIdx = state.column.findIndex( c => c._id === columnId)

            if(columnIdx !== -1){
                state.column[columnIdx].tasks = [
                    ...(state.column[columnIdx].tasks || []),task
                ]
            }
        }
    }
})

export const { setTask , updateColumn } = taskSlice.actions
export default taskSlice.reducer