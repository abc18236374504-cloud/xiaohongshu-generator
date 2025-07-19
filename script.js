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

async function generateContent(prompt, button, buttonText, resultDiv) {
    setLoadingState(button, '生成中...');
    try {
        const glmApiUrl = `https://api.52vmy.cn/api/chat/glm?msg=${encodeURIComponent(prompt)}`;
        const response = await fetch(glmApiUrl);
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
        await generateContent(prompt, generateBtn, '🚀 生成原创文案', resultDiv);
    });

    // Article rewriting
    rewriteBtn.addEventListener('click', async () => {
        const originalTitleInput = document.getElementById('original-title');
        const originalContentInput = document.getElementById('original-content');
        const rewriteToneStyleSelect = document.getElementById('rewrite-tone-style');

        const title = originalTitleInput.value.trim();
        const content = originalContentInput.value.trim();

        if (!title || !content) {
            resultDiv.innerHTML = '<p style="color: var(--primary-color);">请输入原文的标题和内容！</p>';
            return;
        }

        const rewritePrompt = `
请你扮演一位资深的小红书博主，对我提供的以下文章进行二次创作和优化，使其更具吸引力和爆款潜质。
**这是原始文章：**
- **标题：** ${title}
- **内容：** ${content}

**请严格遵守以下改写要求：**
1.  **核心思想不变**：保持原文的核心观点和信息。
2.  **语气风格**：请使用 **${rewriteToneStyleSelect.value}** 的风格进行改写。
3.  **结构优化**：优化文章结构，使其更清晰、更易读。
4.  **内容润色**：用更生动、更有趣的语言进行表达，多使用 emoji。
5.  **增强吸引力**：添加引人入胜的开头和结尾。
6.  **添加标签**：在文末生成相关的、热门的 hashtags。
请输出改写后的完整文案。
`;

        await generateContent(rewritePrompt, rewriteBtn, '🔁 一键改写文章', resultDiv);
    });
});
