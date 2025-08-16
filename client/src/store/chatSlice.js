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
        }
    }
})

export const { setMessageDetails, addMessageDetails, updateConversationWithNewMessage } = chatSlice.actions
export default chatSlice.reducer