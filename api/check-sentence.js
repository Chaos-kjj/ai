// api/check-sentence.js

module.exports = async (req, res) => {
  // 1. 检查请求方法和内容
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { word, sentence } = req.body;
  if (!word || !sentence) {
    return res.status(400).json({ error: 'Word and sentence are required.' });
  
  // (已更新) 现在可以接收单个单词或一个单词数组
  const { words, sentence } = req.body; 
  
  if (!words || !sentence || words.length === 0) {
    return res.status(400).json({ error: 'Words and sentence are required.' });
  }

  // 2. 准备向 SiliconCloud API 发送的请求
  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";

  // 将单词数组转换为一个易于阅读的字符串
  const wordListString = Array.isArray(words) ? words.join(', ') : words;

  const payload = {
    model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    messages: [
      {
        role: "system",
        content: "你是一个友善且专业的英语老师。你的任务是判断用户提供的句子是否正确地使用了给定的单词，并提供反馈。你的回答必须严格遵循用户指定的JSON格式，所有内容都必须使用中文。"
        content: "你是一个友善且专业的英语老师。你的任务是判断用户提供的句子是否正确、流畅地使用了所有给定的单词，并提供反馈。你的回答必须严格遵循用户指定的JSON格式，所有内容都必须使用中文。"
      },
      {
        role: "user",
        content: `请判断句子 "${sentence}" 是否正确地使用了单词 "${word}"。返回的JSON格式必须是：{"is_correct": boolean, "explanation": "简短解释", "correct_example": "提供一两个正确例句"}`
        content: `请判断句子 "${sentence}" 是否正确地使用了以下所有单词: "${wordListString}"。返回的JSON格式必须是：{"is_correct": boolean, "explanation": "简短解释，说明用法是否地道，或者句子有什么问题", "correct_example": "提供一个使用了所有这些单词的正确、地道的例句"}`
      }
    ],
    response_format: { "type": "json_object" }

@@ -48,19 +54,18 @@
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // (已更新) 更强大的JSON提取和解析逻辑
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("AI response did not contain a valid JSON object.");
    }
    const jsonString = jsonMatch[0];
    const feedbackJson = JSON.parse(jsonString);

    res.status(200).json(feedbackJson);

  } catch (error) {
    console.error('Check Sentence Backend Error:', error);
    res.status(500).json({ error: 'Failed to get feedback from AI.', details: error.message });
  }
};
