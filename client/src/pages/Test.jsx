import React from 'react'

const Test = () => {
    return (
        <>
            <section className="h-[calc(100vh-60px)] w-full grid grid-rows-[64px_1fr_60px] relative overflow-hidden">
                {/* Header */}
                <div className="bg-[#21222b] z-50 px-4 flex items-center justify-between text-white shadow-md shadow-[#57575765]">
                    {/* left */}
                    <div className="flex gap-2.5 items-center">
                        <RxAvatar size={38} />
                        {location?.allMessageDetails?.group_type === "GROUP" ? (
                            <p className="text-lg">{location?.allMessageDetails?.group_name}</p>
                        ) : (
                            <div className="flex flex-col text-base">
                                <p>{location?.allMessageDetails?.otherUser?.name}</p>
                                <p className="text-sm opacity-75">{location?.allMessageDetails?.otherUser?.userId}</p>
                            </div>
                        )}
                    </div>
                    {/* right */}
                    <MdManageSearch size={30} className="cursor-pointer" />
                </div>

                {/* Messages */}
                <div className="overflow-y-auto px-2.5 py-4 flex flex-col gap-2.5 chat-scrollbar">
                    {Array.isArray(messages) &&
                        messages.map((value, index) => {
                            const isSelfMessage =
                                value?.senderId?._id === user?._id || value?.senderId === user?._id;
                            const date = new Date(value?.createdAt);
                            const indianTime = date.toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            });

                            return (
                                <div
                                    key={`msg-${index}`}
                                    className={`bg-[#f1f1f1] max-w-[75%] break-words text-base rounded text-blue-950 px-3 py-1 ${isSelfMessage ? "self-end" : "self-start"
                                        }`}
                                >
                                    {isGroup && !isSelfMessage && (
                                        <p className="text-xs font-medium text-gray-600">{value?.senderName}</p>
                                    )}

                                    {value?.image && <img src={value.image} alt="" className="w-[200px] rounded-md" />}
                                    {value?.video && <video src={value.video} controls className="w-[200px] rounded-md"></video>}
                                    {value?.other_fileUrl_or_external_link && (
                                        <button
                                            onClick={() => window.open(value.other_fileUrl_or_external_link, "_blank")}
                                            className="bg-blue-500 text-white px-3 py-1 rounded mt-1"
                                        >
                                            Open File
                                        </button>
                                    )}

                                    {value?.text && <p className="mt-1">{value.text}</p>}

                                    <p className="text-xs opacity-60 text-right">{indianTime}</p>
                                </div>
                            );
                        })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer */}
                <div className="bg-[#1f2029] py-3 w-full grid grid-cols-[60px_1fr_60px] items-center text-white shadow-md shadow-[#154174]">
                    {/* Attachments */}
                    <div className="flex items-center justify-center relative">
                        <MdAttachment size={26} onClick={() => setOpenAttach(!openAttach)} className="cursor-pointer" />
                        {openAttach && (
                            <div ref={attachRef} className="absolute bottom-12 left-6 bg-white text-blue-950 rounded-lg p-3 flex gap-4">
                                <div onClick={() => imgRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                    <IoImage size={32} />
                                    <p className="text-xs">Image</p>
                                    <input ref={imgRef} onChange={handleAllAtachFile} type="file" accept="image/*" name="image" hidden />
                                </div>
                                <div onClick={() => videoRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                    <RiFolderVideoFill size={32} />
                                    <p className="text-xs">Video</p>
                                    <input ref={videoRef} onChange={handleAllAtachFile} type="file" accept="video/*" name="video" hidden />
                                </div>
                                <div onClick={() => fileUrlRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                    <FaFileAlt size={32} />
                                    <p className="text-xs">File</p>
                                    <input ref={fileUrlRef} onChange={handleAllAtachFile} type="file" accept="application/pdf" name="other_fileUrl_or_external_link" hidden />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                isGroup ? handleGroupMessageSend() : handleOnClick();
                            }
                        }}
                        className="w-full bg-transparent outline-none px-2 text-white"
                        placeholder="Type a message..."
                    />

                    {/* Send */}
                    <div className="flex items-center justify-center cursor-pointer">
                        <IoSendOutline size={26} onClick={() => (isGroup ? handleGroupMessageSend() : handleOnClick())} />
                    </div>
                </div>
            </section>
            
        </>
    )
}

export default Test
