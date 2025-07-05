// api/check-sentence.js

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { words, sentence } = req.body;
  if (!words || !sentence || words.length === 0) {
    return res.status(400).json({ error: 'Words and sentence are required.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const apiUrl = "https://api.siliconflow.cn/v1/chat/completions";
  const wordListString = Array.isArray(words) ? words.join(', ') : words;

  const payload = {
    model: "deepseek-ai/deepseek-v2-lite",
    messages: [
      {
        role: "system",
        content: "你是一个友善且专业的英语老师。你的任务是判断用户提供的句子是否正确、流畅地使用了所有给定的单词，并提供反馈。你的回答必须严格遵循JSON格式，所有内容都必须使用中文。重要：如果生成的文本中包含任何双引号(\")，你必须用反斜杠进行转义，写作 \\\"。"
      },
      {
        role: "user",
        content: `请判断句子 "${sentence}" 是否正确地使用了以下所有单词: "${wordListString}"。返回的JSON格式必须是：{"is_correct": boolean, "explanation": "简短解释，说明用法是否地道，或者句子有什么问题", "correct_example": "提供一个使用了所有这些单词的正确、地道的例句"}`
      }
    ],
    response_format: { "type": "json_object" }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`SiliconCloud API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
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
