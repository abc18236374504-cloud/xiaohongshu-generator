// Tab switching logic
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.addEventListener('DOMContentLoaded', () => {
    // Activate the first tab by default
    document.querySelector('.tab-link').click();

    const generateBtn = document.getElementById('generate-btn');
    const rewriteBtn = document.getElementById('rewrite-btn');
    const resultDiv = document.getElementById('result');

    // Original content generation
    generateBtn.addEventListener('click', async () => {
        const topicInput = document.getElementById('topic');
        const noteTypeSelect = document.getElementById('note-type');
        const toneStyleSelect = document.getElementById('tone-style');
        const wordCountSelect = document.getElementById('word-count');

        const topic = topicInput.value.trim();
        if (!topic) {
            resultDiv.innerHTML = '<p style="color: var(--primary-color);">请输入核心主题！</p>';
            return;
        }

        const prompt = `
请你扮演一位资深的小红书博主，为我创作一篇关于“${topic}”的爆款文案。
请严格遵守以下要求：
1.  **笔记类型**：${noteTypeSelect.value}
2.  **字数要求**：${wordCountSelect.value}
3.  **语气风格**：${toneStyleSelect.value}
4.  **内容要求**：
    - 开头要吸引人，能够迅速抓住读者眼球。
    - 内容结构清晰，有逻辑，易于阅读。
    - 多使用 emoji 来增加文本的生动性和趣味性。
    - 结尾处要加上相关的、热门的 hashtags，至少包含3个。
请开始你的创作吧！
`;
        await generateContent(prompt, generateBtn, '🚀 生成原创文案');
    });

    // Article rewriting
    rewriteBtn.addEventListener('click', async () => {
        const xhsUrlInput = document.getElementById('xhs-url');
        const rewriteToneStyleSelect = document.getElementById('rewrite-tone-style');

        const userInput = xhsUrlInput.value.trim();
        if (!userInput) {
            resultDiv.innerHTML = '<p style="color: var(--primary-color);">请输入小红书文章链接或分享口令！</p>';
            return;
        }

        // Extract URL from sharing command
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = userInput.match(urlRegex);
        if (!urls || urls.length === 0) {
            resultDiv.innerHTML = '<p style="color: var(--primary-color);">无法从输入中找到有效的链接！</p>';
            return;
        }
        const url = urls[0];

        resultDiv.innerHTML = '<p>正在获取文章内容...</p>';
        setLoadingState(rewriteBtn, '获取中...');

        try {
            // Step 1: Resolve the short link to get the final URL
            resultDiv.innerHTML = '<p>正在解析短链接...</p>';
            const resolveResponse = await fetch(`https://api.52vmy.cn/api/other/url/expand?url=${encodeURIComponent(url)}`);
            if (!resolveResponse.ok) {
                throw new Error(`短链接解析失败，状态码: ${resolveResponse.status}`);
            }
            const resolveData = await resolveResponse.json();
            if (resolveData.code !== 200 || !resolveData.data || !resolveData.data.long_url) {
                 throw new Error('无法解析到有效的小红书长链接。');
            }
            const finalUrl = resolveData.data.long_url;

            resultDiv.innerHTML = '<p>链接解析成功，正在获取文章内容...</p>';

            // Step 2: Fetch article details with the final URL
            const token = "0c17bf1b49ca7333483ffcbebe201d4a"; // As provided
            const detailApiUrl = `https://api.istero.com/resource/v1/red/book/detail/get?token=${token}&url=${encodeURIComponent(finalUrl)}`;
            const detailResponse = await fetch(detailApiUrl);

            if (!detailResponse.ok) {
                throw new Error(`获取文章详情失败，状态码: ${detailResponse.status}`);
            }
            const detailData = await detailResponse.json();

            if (detailData.code !== 200 || !detailData.data) {
                throw new Error(`API 返回错误: ${detailData.message || '无法获取文章内容'}`);
            }

            const articleTitle = detailData.data.title;
            const articleContent = detailData.data.desc;

            // Step 2: Generate rewriting prompt
            const rewritePrompt = `
请你扮演一位资深的小红书博主，对我提供的以下文章进行二次创作和优化，使其更具吸引力和爆款潜质。
**这是原始文章：**
- **标题：** ${articleTitle}
- **内容：** ${articleContent}

**请严格遵守以下改写要求：**
1.  **核心思想不变**：保持原文的核心观点和信息。
2.  **语气风格**：请使用 **${rewriteToneStyleSelect.value}** 的风格进行改写。
3.  **结构优化**：优化文章结构，使其更清晰、更易读。
4.  **内容润色**：用更生动、更有趣的语言进行表达，多使用 emoji。
5.  **增强吸引力**：添加引人入胜的开头和结尾。
6.  **添加标签**：在文末生成相关的、热门的 hashtags。
请输出改写后的完整文案。
`;

            resultDiv.innerHTML = '<p>获取成功，正在改写文章...</p>';
            await generateContent(rewritePrompt, rewriteBtn, '🔁 一键改写文章');

        } catch (error) {
            console.error('Rewrite process failed:', error);
            resultDiv.innerHTML = `<p style="color: var(--primary-color);">处理失败：${error.message}</p>`;
            setIdleState(rewriteBtn, '🔁 一键改写文章');
        }
    });

    async function generateContent(prompt, button, buttonText) {
        setLoadingState(button, '生成中...');
        try {
            const response = await fetch(`https://api.52vmy.cn/api/chat/glm?msg=${encodeURIComponent(prompt)}`);
            if (!response.ok) throw new Error(`AI 服务请求失败，状态码: ${response.status}`);

            const data = await response.json();
            if (data.code === 200 && data.data && data.data.answer) {
                resultDiv.innerHTML = `<p>${data.data.answer.replace(/\n/g, '<br>')}</p>`;
            } else {
                throw new Error(`AI 服务返回错误: ${data.msg || '未知错误'}`);
            }
        } catch (error) {
            console.error('Content generation failed:', error);
            resultDiv.innerHTML = `<p style="color: var(--primary-color);">生成失败：${error.message}</p>`;
        } finally {
            setIdleState(button, buttonText);
        }
    }

    function setLoadingState(button, text) {
        button.disabled = true;
        button.textContent = text;
        button.style.cursor = 'not-allowed';
        button.style.opacity = '0.7';
    }

    function setIdleState(button, text) {
        button.disabled = false;
        button.textContent = text;
        button.style.cursor = 'pointer';
        button.style.opacity = '1';
    }
});
