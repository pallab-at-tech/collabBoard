import React, { useState } from 'react'
import { useSelector } from 'react-redux';

const SelectMember = ({ close, data, setAssignData }) => {


    const [selectedMembers, setSelectedMembers] = useState((data.length !== 0 && data) || []);


    const toggleSelect = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = () => {
        setAssignData(prev => {
            return{
                ...prev,
                assignTo : selectedMembers
            }
        })
        close();
    };

    const team = useSelector(state => state.team)
    const userId = useSelector( state => state?.user?.userId)

    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-gray-800/70'>

            <div className='mt-10 bg-[#dbdbdb] max-h-[420px] min-w-[220px] max-w-[220px] overflow-y-auto rounded-lg  narrow-scrollbar p-3'>

                <p className='text-center pb-1 text-lg'>Assign to</p>

                {
                    Array.isArray(team?.member) && team?.member?.map((val, idx) => {
                        const isSelected = selectedMembers.includes(val?.userName);

                        return (
                            <div
                                key={val._id}
                                className={`${userId === val?.userName ? "hidden" : "block"} flex justify-between items-center p-3 rounded-md border ${isSelected ? "bg-green-100 border-green-400" : "bg-white border-gray-300"} transition my-1`}
                            >
                                <div>
                                    <p className="text-gray-800 font-medium pb-1">{val?.userName}</p>

                                    <button
                                        onClick={() => toggleSelect(val?.userName)}
                                        className={`text-sm px-3 py-1 rounded-md font-medium transition ${isSelected
                                            ? "bg-red-500 text-white hover:bg-red-600"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                    >
                                        {isSelected ? "Unselect" : "Select"}
                                    </button>
                                </div>

                            </div>
                        )
                    })
                }

                {/* Action Buttons */}
                <div className='flex justify-end gap-4 mt-2'>

                    <button
                        onClick={close}
                        className='bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition'
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className='bg-green-600 text-white px-2.5 py-1.5 rounded-md hover:bg-green-700 transition'
                    >
                        Save
                    </button>

                </div>

            </div>

        </section>
    )
}

export default SelectMember
