document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const topicInput = document.getElementById('topic');
    const noteTypeSelect = document.getElementById('note-type');
    const toneStyleSelect = document.getElementById('tone-style');
    const wordCountSelect = document.getElementById('word-count');
    const resultDiv = document.getElementById('result');

    generateBtn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        const noteType = noteTypeSelect.value;
        const toneStyle = toneStyleSelect.value;
        const wordCount = wordCountSelect.value;

        if (!topic) {
            resultDiv.innerHTML = '<p style="color: var(--primary-color);">请输入核心主题！</p>';
            return;
        }

        resultDiv.innerHTML = '<p>正在生成中，请稍候...</p>';
        generateBtn.disabled = true;
        generateBtn.textContent = '生成中...';
        generateBtn.style.cursor = 'not-allowed';
        generateBtn.style.opacity = '0.7';

        try {
            const prompt = `
请你扮演一位资深的小红书博主，为我创作一篇关于“${topic}”的爆款文案。
请严格遵守以下要求：
1.  **笔记类型**：${noteType}
2.  **字数要求**：${wordCount}
3.  **语气风格**：${toneStyle}
4.  **内容要求**：
    - 开头要吸引人，能够迅速抓住读者眼球。
    - 内容结构清晰，有逻辑，易于阅读。
    - 多使用 emoji 来增加文本的生动性和趣味性。
    - 结尾处要加上相关的、热门的 hashtags，至少包含3个。
请开始你的创作吧！
`;
            const response = await fetch(`https://api.52vmy.cn/api/chat/glm?msg=${encodeURIComponent(prompt)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 200 && data.data && data.data.answer) {
                resultDiv.innerHTML = `<p>${data.data.answer.replace(/\n/g, '<br>')}</p>`;
            } else {
                resultDiv.innerHTML = `<p style="color: var(--primary-color);">生成失败，请稍后再试。错误信息：${data.msg || '未知错误'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching API:', error);
            resultDiv.innerHTML = `<p style="color: var(--primary-color);">请求出错，请检查网络连接或联系管理员。</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = '🚀 生成文案';
            generateBtn.style.cursor = 'pointer';
            generateBtn.style.opacity = '1';
        }
    });
});
