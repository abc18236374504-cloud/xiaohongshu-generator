document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const keywordsTextarea = document.getElementById('keywords');
    const resultDiv = document.getElementById('result');

    generateBtn.addEventListener('click', async () => {
        const keywords = keywordsTextarea.value.trim();

        if (!keywords) {
            resultDiv.innerHTML = '<p style="color: red;">请输入关键词！</p>';
            return;
        }

        resultDiv.innerHTML = '<p>正在生成中，请稍候...</p>';
        generateBtn.disabled = true;
        generateBtn.style.cursor = 'not-allowed';
        generateBtn.style.opacity = '0.7';

        try {
            const prompt = `请你扮演一位小红书博主，以“惊呆了！姐妹们！”为开头，围绕“${keywords}”这个主题，写一篇充满吸引力的种草文案，多用 emoji，结尾加上合适的 hashtags。`;
            const response = await fetch(`https://api.52vmy.cn/api/chat/glm?msg=${encodeURIComponent(prompt)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 200 && data.data && data.data.answer) {
                resultDiv.innerHTML = `<p>${data.data.answer.replace(/\\n/g, '<br>')}</p>`;
            } else {
                resultDiv.innerHTML = `<p style="color: red;">生成失败，请稍后再试。错误信息：${data.msg || '未知错误'}</p>`;
            }
        } catch (error) {
            console.error('Error fetching API:', error);
            resultDiv.innerHTML = `<p style="color: red;">请求出错，请检查网络连接或联系管理员。</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.style.cursor = 'pointer';
            generateBtn.style.opacity = '1';
        }
    });
});
