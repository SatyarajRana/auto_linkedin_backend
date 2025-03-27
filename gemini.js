const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// const test = async () => {
//   const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//   console.log("api key is: ", GEMINI_API_KEY);

//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//   const prompt = "Explain how AI works";

//   const result = await model.generateContent(prompt);
//   console.log(result.response.text());
// };

// test();

const getGeminiResponse = async (prompt) => {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  return result.response.text();
};

async function createPost(context, char_length) {
  let prompt =
    "I want to create a linkedin post. Here is some context, create a suitable post in " +
    char_length +
    " words. Context: " +
    context;
  const response = await getGeminiResponse(prompt);
  return response;
}
module.exports = { createPost };
