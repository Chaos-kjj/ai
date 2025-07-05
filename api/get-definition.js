// api/get-definition.js

module.exports = async (req, res) => {
  // 1. 检查请求方法和内容
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Word is required.' });
  }

  // 2. (已更新) 直接调用免费的英汉词典API
  // 我们将使用一个公共的、无需密钥的词典服务
  const dictionaryApiUrl = `https://dict.youdao.com/jsonapi?q=${word}`;

  try {
    const response = await fetch(dictionaryApiUrl);
    
    if (!response.ok) {
      throw new Error(`Dictionary API error: ${response.status}`);
    }

    const data = await response.json();

    // 3. 从复杂的返回数据中解析出我们需要的信息
    let pronunciation = '';
    let definition = '未找到释义。';

    // 尝试获取英式或美式音标
    if (data.ec && data.ec.word && data.ec.word[0]) {
        const wordData = data.ec.word[0];
        if (wordData.ukphone) {
            pronunciation = `[${wordData.ukphone}]`;
        } else if (wordData.usphone) {
            pronunciation = `[${wordData.usphone}]`;
        }
    }

    // 尝试获取中文释义
    if (data.ec && data.ec.word && data.ec.word[0].trs) {
        // 将所有词性的释义拼接起来
        const definitions = data.ec.word[0].trs.map(tr => tr.tr[0].l.i[0]).join('; ');
        if (definitions) {
            definition = definitions;
        }
    }
    
    // 4. 将解析好的数据返回给前端
    res.status(200).json({
      pronunciation: pronunciation,
      definition: definition
    });

  } catch (error) {
    console.error('Get Definition Backend Error:', error);
    res.status(500).json({ error: 'Failed to get definition from dictionary.', details: error.message });
  }
};

