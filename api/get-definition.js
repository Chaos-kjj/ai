const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `你是一个精准的英汉词典。请提供单词 "${word}" 的音标和最核心的中文释义。
    你的回答必须严格遵循以下JSON格式，不要包含任何额外的文字或标记：
    {
      "pronunciation": "这里是单词的英式或美式音标",
      "definition": "这里是最常用、最核心的中文释义（例如：v. 放弃；n. 自由）"
    }`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain a valid JSON object for definition.");
    }
    
    const jsonString = jsonMatch[0];
    const definitionJson = JSON.parse(jsonString);

    res.status(200).json(definitionJson);

  } catch (error) {
    console.error('Get Definition Backend Error:', error);
    res.status(500).json({ error: 'Failed to get definition from AI.', details: error.message });
  }
};
