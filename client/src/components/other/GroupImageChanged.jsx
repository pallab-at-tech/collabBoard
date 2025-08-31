import React, { useState } from 'react'
import { FaUpload } from 'react-icons/fa6'
import { RxAvatar } from "react-icons/rx";
import uploadFile from '../../utils/uploadFile';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../provider/GlobalProvider';
import { updateGroupImage } from '../../store/chatSlice';

const GroupImageChanged = ({ close, initialValue, group_id, onUpdated }) => {

  const [uploadImg, setUploadImg] = useState(initialValue?.value || "")
  const [load, setLoad] = useState(false)

  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  const { socketConnection } = useGlobalContext()

  const handleFileChange = async (e) => {

    try {

      setLoad(true)
      const file = e.target.files?.[0]
      if (!file) return

      const response = await uploadFile(file)
      setUploadImg(response?.secure_url)

    } catch (error) {
      console.log("File error from GroupImageChanged", error)
    } finally {
      setLoad(false)
    }

  }

  const handleOnSubmit = async (e) => {

    e.preventDefault()

    let errorHandled = false;

    // Listen for error just once
    socketConnection.once("update_error", (data) => {
      toast.error(data?.message || "Failed to update group name");
      errorHandled = true;
      close();
    });

    // Emit the update request
    socketConnection.emit("update_group_details", {
      group_id: group_id?.group_id,
      userId: user?._id,
      userName: user?.name,
      group_image: uploadImg
    });

    // Small delay to see if error is returned
    setTimeout(() => {
      if (!errorHandled) {
        toast.success("Group profile successfully updated");
        dispatch(updateGroupImage({
          group_Id: group_id?.group_id,
          group_image: uploadImg
        }));
        onUpdated(uploadImg);
        setUploadImg("")
        close();
      }
    }, 500);
  }


  return (
    <section className='fixed inset-0 flex items-center justify-center z-50 bg-gray-800/40'>

      <form onSubmit={handleOnSubmit} className="bg-white w-fit max-w-md p-6 rounded-2xl shadow-xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Change Group Image</h2>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col  space-y-3 text-black">

          <div className='flex items-center justify-between gap-x-6'>

            {
              uploadImg ? (
                <div className='rounded-full w-fit h-fit border-2 p-1 border-[#5f7fc5]'>
                  <img src={uploadImg} alt="" className='w-[60px] h-[60px] rounded-full' />
                </div>
              ) : (
                <RxAvatar size={71} />
              )
            }

            <label
              htmlFor="fileUpload"
              className="cursor-pointer w-[160px] h-[40px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >

              {
                load ? (
                  <div className='loaderforGroup'></div>
                ) : (
                  <>
                    <FaUpload size={18} />
                    <p>Upload Image</p>
                  </>
                )
              }

            </label>

          </div>

          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">

          <div
            onClick={close}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
          >
            Cancel
          </div>

          <button
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Save
          </button>

        </div>

      </form>

    </section>
  )
}

export default GroupImageChanged
