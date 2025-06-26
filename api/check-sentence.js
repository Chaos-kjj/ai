const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { word, sentence } = req.body;

    if (!word || !sentence) {
      return res.status(400).json({ error: 'Word and sentence are required.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `你是一个友善且专业的英语老师。请判断下面的句子是否正确地使用了单词 "${word}"。
    用户造的句子是: "${sentence}"
    你的反馈需要遵循以下JSON格式，并且必须使用中文回答：
    {
      "is_correct": boolean,
      "explanation": "对你的判断进行简短解释，比如语法错误或用法不地道。",
      "correct_example": "提供一个或两个关于'${word}'这个单词的正确、地道的例句。"
    }`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // --- BUG修复：智能提取JSON ---
    // AI返回的文本可能包含 "```json" 等标记，我们只提取 { ... } 之间的部分
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        // 如果连 { ... } 都找不到，说明AI返回了非预期的格式
        throw new Error("AI response did not contain a valid JSON object.");
    }

    const jsonString = jsonMatch[0];
    const feedbackJson = JSON.parse(jsonString); // 现在只解析纯净的JSON字符串

    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error('Backend Error:', error); // 在服务器日志中打印更详细的错误
    res.status(500).json({ error: 'Failed to get feedback from AI.', details: error.message });
  }
};