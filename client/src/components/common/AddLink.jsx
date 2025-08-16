import React, { useState } from 'react'

const AddLink = ({ close, data, setLinkData }) => {

    
    // Initialize with existing data or one empty row
    const [links, setLinks] = useState((data.length !== 0 && data) || [{ name: '', url: '' }]);

    // Update input fields
    const handleChange = (index, field, value) => {
        const updatedLinks = [...links];
        updatedLinks[index][field] = value;
        setLinks(updatedLinks);
    };

    // Add a new blank link row
    const handleAddRow = () => {
        setLinks([...links, { name: '', url: '' }]);
    };

    // Save all links
    const handleSave = () => {
        // Optional: validate inputs
        const validLinks = links.filter(link => link.name.trim() && link.url.trim());
        setLinkData(prev => ({ ...prev, aditional_link: validLinks }));
        close();
    };

    return (
        <section className='fixed inset-0 flex items-center justify-center z-50 bg-black/60'>

            <div className='bg-white w-full sm:max-w-md max-w-[340px] rounded-2xl px-6 py-6 flex flex-col gap-6 shadow-lg'>

                <h2 className='text-xl font-semibold text-gray-800'>Add Links</h2>

                {/* Multiple rows for name + URL */}
                <div className='flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2'>
                    {links.map((link, index) => (
                        <div key={index} className='flex flex-col gap-2 my-2 ml-1'>
                            <input
                                type="text"
                                placeholder="Name"
                                value={link.name}
                                onChange={(e) => handleChange(index, 'name', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                            />
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={link.url}
                                onChange={(e) => handleChange(index, 'url', e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                            />
                        </div>
                    ))}
                </div>

                {/* Add Row Button */}
                <button
                    onClick={handleAddRow}
                    className='text-green-600 font-medium hover:underline self-start'
                >
                    + Add another link
                </button>

                {/* Action Buttons */}
                <div className='flex justify-end gap-4'>

                    <button
                        onClick={close}
                        className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition'
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition'
                    >
                        Save
                    </button>

                </div>

            </div>
        </section>
    );
};

export default AddLink;
