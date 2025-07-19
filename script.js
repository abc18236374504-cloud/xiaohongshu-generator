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
            const response = await fetch(`https://api.52vmy.cn/api/chat/spark?msg=${encodeURIComponent(keywords)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.code === 200 && data.data && data.data.answer) {
                const optimizedText = optimizeText(data.data.answer);
                resultDiv.innerHTML = `<p>${optimizedText.replace(/\n/g, '<br>')}</p>`;
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

    function optimizeText(text) {
        const paragraphs = text.split(/\\n/g).filter(p => p.trim() !== '');
        const keywords = keywordsTextarea.value.trim();

        const emojiMap = {
            // 生活方式 & 情感
            "OOTD": "👗👠👜", "穿搭": "👚👖👟", "日常": "☀️😊💖", "vlog": "📹✨", "好物": "🛍️🎁", "分享": "💖✨", "生活": "🏡🌿", "快乐": "😄🎉", "幸福": "🥰💕",
            // 美食 & 饮品
            "美食": "🍔🍕🍰", "探店": "📍🍜", "下午茶": "☕🍰", "咖啡": "☕✨", "甜品": "🍩🍪",
            // 旅行 & 探索
            "旅行": "✈️🌍🗺️", "旅游": "🏞️🚗", "攻略": "📝🗺️", "周末": "🤸‍♀️🎉", "假期": "🏖️☀️",
            // 美妆 & 护肤
            "美妆": "💄💅✨", "护肤": "🧴💧", "彩妆": "🎨💋", "口红": "💄❤️",
            // 学习 & 成长
            "学习": "📚✍️💡", "干货": "📌🔥", "读书": "📖🤓", "笔记": "📝✍️",
            // 运动 & 健康
            "健身": "💪🏋️‍♀️", "运动": "🏃‍♀️🤸‍♂️", "健康": "🥗🍎",
        };

        let optimizedParagraphs = paragraphs.map((p, index) => {
            let paragraphContent = p;
            let addedEmoji = '';

            // 尝试在段落开头添加表情
            if (index === 0) {
                for (const keyword in emojiMap) {
                    if (keywords.includes(keyword) || p.includes(keyword)) {
                        addedEmoji = emojiMap[keyword][Math.floor(Math.random() * emojiMap[keyword].length)];
                        break;
                    }
                }
                if (addedEmoji) {
                    paragraphContent = `${addedEmoji} ${p}`;
                }
            } else { // 在段落结尾添加表情
                 for (const keyword in emojiMap) {
                    if (keywords.includes(keyword) || p.includes(keyword)) {
                        addedEmoji = emojiMap[keyword][Math.floor(Math.random() * emojiMap[keyword].length)];
                        break;
                    }
                }
                 if (addedEmoji) {
                    paragraphContent = `${p} ${addedEmoji}`;
                }
            }
            return paragraphContent;
        });

        // 生成动态标签
        const userKeywords = keywords.split(/[\s,，]+/).filter(k => k);
        const fixedTags = ["#笔记灵感", "#小红书爆款", "#我的日常"];
        const dynamicTags = userKeywords.map(k => `#${k}`);
        const allTags = [...new Set([...fixedTags, ...dynamicTags])].join(' ');

        return optimizedParagraphs.join('\n\n') + `\n\n${allTags}`;
    }
});
