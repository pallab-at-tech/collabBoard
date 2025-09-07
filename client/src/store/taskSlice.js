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

            if (columnIdx !== -1) {
                const taskIdx = state.column[columnIdx].tasks?.findIndex(c => c?._id === taskId)

                if (taskIdx !== -1) {
                    state.column[columnIdx].tasks[taskIdx] = task
                }

            }

        },
        sortColumnByCreatedAt: (state, action) => {

            state.column.forEach(c => {
                c.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            })

            state.column.sort((a, b) => {
                const aDate = a.tasks.length > 0 ? new Date(a.tasks[0].createdAt) : -Infinity
                const bDate = b.tasks.length > 0 ? new Date(b.tasks[0].createdAt) : -Infinity

                return bDate - aDate
            })

        },
        sortColumnByUpdatedAt: (state, action) => {

            state.column.forEach(c => {
                c.tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            })

            state.column.sort((a, b) => {
                const aDate = a.tasks.length > 0 ? new Date(a.tasks[0].updatedAt) : -Infinity
                const bDate = b.tasks.length > 0 ? new Date(b.tasks[0].updatedAt) : -Infinity

                return bDate - aDate
            })

        },
        sortColumnByDeadLine: (state, action) => {

            state.column.forEach(c => {
                c.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            })

            state.column.sort((a, b) => {
                const aDate = a.tasks.length > 0 ? new Date(a.tasks[0].dueDate) : Infinity
                const bDate = b.tasks.length > 0 ? new Date(b.tasks[0].dueDate) : Infinity

                return aDate - bDate
            })
        },
        setTaskLogOut : (state , action) =>{
            state._id = ""
            state.teamId = ""
            state.name = ""
            state.column = []
        }
    }
})

export const { setTask, updateColumnByTaskAssign, updateColumnByTaskUnAssign,
    updateColumn, sortColumnByCreatedAt, sortColumnByUpdatedAt, sortColumnByDeadLine,
    setTaskLogOut
} = taskSlice.actions

export default taskSlice.reducer