import React, { useEffect, useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../provider/GlobalProvider';
import { useSelector } from 'react-redux';


const ProfileEdit = ({ close }) => {
    const [data, setData] = useState({ about: '' });
    const [submitAvailable, setSubmitAvailable] = useState(true);

    const { fetchUserAllDetails } = useGlobalContext()
    const user = useSelector(state => state.user)

    useEffect(() => {
        setData({
            about: user?.about || ""
        })
    }, [])

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            setSubmitAvailable(false)

            const response = await Axios({
                ...SummaryApi.user_update,
                data: {
                    about: data.about
                }
            })

            if (response?.data?.error) {
                toast.error(response?.data?.message)
            }

            if (response?.data?.success) {
                toast.success(response?.data?.message)

                setData({
                    about: ""
                })
                fetchUserAllDetails()
                close()
            }

        } catch (error) {
            console.log("ProfileEdit error", error)
        } finally {
            setSubmitAvailable(true)
        }
    };

    return (
        <section className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 text-black">

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg relative"
            >
                <IoCloseSharp
                    size={24}
                    className="absolute top-3 right-3 text-gray-600 hover:text-black cursor-pointer"
                    onClick={close}
                />

                <h2 className="text-xl font-semibold mb-4 text-center">Edit Your Profile</h2>

                <label htmlFor="about" className="block text-sm font-medium mb-1">
                    About Yourself:
                </label>
                <textarea
                    id="about"
                    name="about"
                    value={data.about}
                    onChange={handleChange}
                    placeholder="Write something about you..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none min-h-[100px] outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                    type="submit"
                    className={`mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 ${submitAvailable && data.about ? 'cursor-pointer' : 'pointer-events-none'
                        }`}
                >
                    {user?.about ? "Update" : "Submit"}
                </button>
            </form>

        </section>
    );
};

export default ProfileEdit;
