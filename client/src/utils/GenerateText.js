import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API
});

async function generateContent(stats, columnsOfTask) {

    const currentDate = new Date().toISOString().split("T")[0];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        You are tasked with generating a **project status report**. Use only the provided statistics and task data. The current date is ${currentDate}.

**Important Instructions:**
1. Do NOT include any IDs (neither user IDs nor task IDs) in the report.
2. Use usernames (e.g., "a@hb7J") to identify users.
3. Use task titles instead of any task IDs.
4. Summarize the overall project progress clearly under a heading "Overall Statistics".
5. For each user, under a heading like "User: a@hb7J", include separate sections for:
   - Completed tasks: (list of task titles)
   - To Do tasks: (list of task titles)
   - Overdue tasks: (list of task titles)
   - Total assigned tasks: (count is enough)
6. Use "---" as a separator between each user's section.
7. Format the report in a clear, readable manner.
8.make a conclusion of all at last
9.All header should like that way "header" in capital word and in bold and user the header point should be start with point "." in bold don't use * to identify as a header

**User Statistics:**
${JSON.stringify(stats, null, 2)}


**Task Board Data:**
${JSON.stringify(columnsOfTask, null, 2)}
`,
    });
    return response.text
}

export default generateContent