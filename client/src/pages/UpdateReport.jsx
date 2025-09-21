import React, { useState } from "react";

const UpdateReport = ({ data, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    text: data?.text || "",
    submitByUserId: data?.submitByUserId || "",
    image: data?.image || "",
    video: data?.video || "",
    aditional_link: data?.aditional_link || [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...formData.aditional_link];
    updatedLinks[index] = { ...updatedLinks[index], value };
    setFormData((prev) => ({ ...prev, aditional_link: updatedLinks }));
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      aditional_link: [...prev.aditional_link, { value: "" }],
    }));
  };

  const removeLink = (index) => {
    const updatedLinks = [...formData.aditional_link];
    updatedLinks.splice(index, 1);
    setFormData((prev) => ({ ...prev, aditional_link: updatedLinks }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) onUpdate({ ...data, ...formData });
  };

  return (
    <section className="fixed right-0 left-0 top-[60px] bottom-0 flex flex-col items-center justify-center z-50 bg-[#1e2e465e]">
      <div className="bg-[#dbdbdb] rounded p-6 relative sm:w-[500px] w-full h-auto transition-all duration-200">
        <h2 className="text-xl font-bold mb-4 text-center">Update Report</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Text */}
          <div>
            <label className="block font-semibold">Text</label>
            <input
              type="text"
              name="text"
              value={formData.text}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* SubmitByUserId */}
          <div>
            <label className="block font-semibold">Submit By User ID</label>
            <input
              type="text"
              name="submitByUserId"
              value={formData.submitByUserId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block font-semibold">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Video */}
          <div>
            <label className="block font-semibold">Video URL</label>
            <input
              type="text"
              name="video"
              value={formData.video}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Additional Links */}
          <div>
            <label className="block font-semibold">Additional Links</label>
            {formData.aditional_link.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={link.value || ""}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                  className="flex-1 border px-3 py-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  X
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLink}
              className="bg-blue-500 text-white px-4 py-1 rounded mt-2"
            >
              + Add Link
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UpdateReport;
