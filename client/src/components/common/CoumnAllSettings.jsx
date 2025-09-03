import React, { useState } from 'react';
import { HiPencil, HiTrash, HiOutlinePlusSm } from 'react-icons/hi';
import CreateNewTask from './CreateNewTask';
import RenameColumn from './RenameColumn';
import DeleteColumn from './DeleteColumn';

const CoumnAllSettings = ({columnId , columnName}) => {

    const [openNewTaskForm, setOpenNewTaskForm] = useState(false)
    const [openRenameColumn, setRenameColumn] = useState(false)
    const [openDeleteColumn, setOpenDeleteColumn] = useState(false)

    

    return (
        <div className="w-40 bg-white shadow-lg border border-gray-200 rounded-md overflow-hidden text-sm text-gray-800">

            <button onClick={()=>setOpenNewTaskForm(true)} className="w-full cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                <HiOutlinePlusSm /> Add Task
            </button>

            <button onClick={()=>setRenameColumn(true)} className="w-full cursor-pointer px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                <HiPencil /> Rename Column
            </button>

            <button onClick={()=>setOpenDeleteColumn(true)} className="w-full cursor-pointer px-4 py-2 hover:bg-gray-100 text-red-500 flex items-center gap-2">
                <HiTrash /> Delete Column
            </button>

            {
                openNewTaskForm && (
                    <CreateNewTask close={()=>setOpenNewTaskForm(false)} columnId={columnId} columnName={columnName}/>
                )
            }

            {
                openRenameColumn && (
                    <RenameColumn close={()=>setRenameColumn(false)} columnId={columnId} columnName={columnName}/>
                )
            }

            {
                openDeleteColumn && (
                    <DeleteColumn close={()=>setOpenDeleteColumn(false)} columnId={columnId} columnName={columnName}/>
                )
            }

        </div>
    );
};

export default CoumnAllSettings;