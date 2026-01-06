import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API
});

async function generateContent(stats, columnsOfTask) {

    const currentDate = new Date().toISOString().split("T")[0];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        You are tasked with generating a **report conclusion**. Use only the provided statistics and task data. The current date is ${currentDate}.

        **Important Instructions:**
        1. Do NOT include any IDs (neither user IDs nor task IDs) in the conclusion.
        2. Use usernames (e.g., "a@hb7J") to identify users.
        3. Use task titles instead of any task IDs.
        4.make a good conclusion of all

    **User Statistics:**
    ${JSON.stringify(stats, null, 2)}

    **Task Board Data:**
    ${JSON.stringify(columnsOfTask, null, 2)}
`,
    });
    console.log("response.text",response.text)
    return response.text
}

export default generateContent