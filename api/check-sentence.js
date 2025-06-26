const { GoogleGenerativeAI } = require("@google/generative-ai");

// 从环境变量中安全地获取API密钥
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Vercel会将这个文件自动转换成一个API端点
// 例如：https://your-site.vercel.app/api/check-sentence
module.exports = async (req, res) => {
  // 只接受POST请求
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

    // 将AI返回的字符串解析为JSON对象并发送回前端
    const feedbackJson = JSON.parse(responseText);
    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get feedback from AI.', details: error.message });
  }
};