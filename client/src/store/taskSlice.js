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
        updateColumnByTaskAssign: (state, action) => {
            const { task, columnId } = action.payload
            const columnIdx = state.column.findIndex(c => c._id === columnId)

            if (columnIdx !== -1) {
                state.column[columnIdx].tasks = [
                    ...(state.column[columnIdx].tasks || []), task
                ]
            }
        },
        updateColumnByTaskUnAssign: (state, action) => {

            const { taskId, columnId } = action.payload
            const columnIdx = state.column.findIndex(c => c._id === columnId)

            if (columnIdx !== -1) {
                state.column[columnIdx].tasks = state.column[columnIdx].tasks?.filter(c => c._id !== taskId)
            }

        },
        updateColumn: (state, action) => {

            const { task, taskId, columnId } = action.payload
            const columnIdx = state.column.findIndex(c => c._id === columnId)

            if(columnIdx !== -1){
                const taskIdx = state.column[columnIdx].tasks?.findIndex(c => c?._id === taskId)

                if(taskIdx !== -1){
                    state.column[columnIdx].tasks[taskIdx] = task
                }

            }

        }
    }
})

export const { setTask, updateColumnByTaskAssign, updateColumnByTaskUnAssign , updateColumn } = taskSlice.actions
export default taskSlice.reducer