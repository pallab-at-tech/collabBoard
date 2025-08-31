import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    all_message: []
}

const chatSlice = createSlice({
    name: 'chat',
    initialState: initialValue,
    reducers: {
        setMessageDetails: (state, action) => {
            state.all_message = action.payload?.all_message
        },
        addMessageDetails: (state, action) => {
            state.all_message = [action.payload, ...state.all_message]
        },
        updateConversationWithNewMessage: (state, action) => {
            const { conversation, message } = action.payload;

            const idx = state.all_message.findIndex(
                (c) => c._id === conversation._id
            )

            if (idx != -1) {
                state.all_message[idx].messages.push(message);

                // Move the conversation to the top
                const updated = state.all_message.splice(idx, 1)[0];
                state.all_message.unshift(updated);

            }
            else {
                state.all_message.unshift(conversation)
            }
        },
        updateGroupName: (state, action) => {
            const { group_Id, group_name } = action.payload

            const idx = state.all_message.findIndex(c => c?._id === group_Id)

            if (idx != -1) {
                state.all_message[idx].group_name = group_name
            }
        },
        updateGroupImage: (state, action) => {
            const { group_Id, group_image } = action.payload

            const idx = state.all_message.findIndex(c => c?._id === group_Id)

            if (idx !== -1) {
                state.all_message[idx].group_image = group_image
            }
        },
        updateparticipantsForRemove: (state, action) => {
            const { group_Id, memberId } = action.payload

            const idx = state.all_message.findIndex(c => c?._id === group_Id)

            if (idx !== -1) {
                state.all_message[idx].participants = state.all_message[idx].participants.filter(p => p?._id !== memberId) || []
            }

        },
        removeConversation: (state, action) => {
            const group_Id = action.payload
            state.all_message = state.all_message.filter(c => c?._id !== group_Id)
        },
        updateparticipantsForAdd: (state, action) => {
            const { group_Id, memberId, obj } = action.payload

            const idx = state.all_message.findIndex(c => c?._id === group_Id)

            if (idx !== -1) {
                const exists = state.all_message[idx].participants?.some(
                    (p) => p?._id === memberId
                )

                if (!exists) {
                    state.all_message[idx].participants = [
                        ...(state.all_message[idx].participants || []),
                        obj   
                    ]
                }
            }
        }

    }
})

export const { setMessageDetails, addMessageDetails, updateConversationWithNewMessage, updateGroupName, updateGroupImage, updateparticipantsForRemove, removeConversation , updateparticipantsForAdd } = chatSlice.actions
export default chatSlice.reducer