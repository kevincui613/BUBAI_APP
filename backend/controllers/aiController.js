const axios = require("axios");
const { QWEN_API_KEY, QWEN_API_URL } = require("../config/config");
const { success, errors } = require("../utils/response");

// 生成AI学习计划
exports.generateAiPlan = async (req, res) => {
  try {
    const { goalTitle, periodDays, dailyMinutes, level } = req.body;
    console.log("收到AI请求:", { goalTitle, periodDays, dailyMinutes, level });

    if (!goalTitle || !periodDays || !dailyMinutes || !level) {
      return res.json(errors.PARAM_ERROR("参数不完整"));
    }

    // 构造提示词
    const prompt = `你是一个专业的学习规划师。请为用户生成一个详细的学习计划。

用户信息：
- 学习目标：${goalTitle}
- 计划周期：${periodDays}天
- 每日可用时间：${dailyMinutes}分钟
- 当前水平：${level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级'}

请严格按照以下JSON格式返回，不要有任何额外说明：
{
  "summary": "一句话总结整个学习计划（50字以内）",
  "tips": ["学习建议1", "学习建议2", "学习建议3", "学习建议4", "学习建议5"],
  "tasks": [
    {"day": 1, "content": "第1天的具体学习内容", "duration": ${dailyMinutes}},
    {"day": 2, "content": "第2天的具体学习内容", "duration": ${dailyMinutes}}
  ]
}

要求：
1. tasks数组包含${Math.min(periodDays, 14)}天的任务（最多14天）
2. 每天的学习内容要具体、可执行
3. 根据${level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级'}水平调整难度
4. 内容要有循序渐进的过程`;

    console.log("调用通义千问API...");

    // 调用通义千问API
    const response = await axios.post(
      QWEN_API_URL,
      {
        model: "qwen-turbo",
        input: {
          messages: [
            {
              role: "system",
              content: "你是一个专业的学习规划师，擅长制定详细、可执行的学习计划。"
            },
            {
              role: "user",
              content: prompt
            }
          ]
        },
        parameters: {
          result_format: "message",
          temperature: 0.7,
          max_tokens: 2000
        }
      },
      {
        headers: {
          "Authorization": `Bearer ${QWEN_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("AI响应状态:", response.status);

    // 解析响应
    let aiContent = null;
    
    if (response.data.output?.choices?.[0]?.message?.content) {
      aiContent = response.data.output.choices[0].message.content;
    } else if (response.data.output?.text) {
      aiContent = response.data.output.text;
    } else {
      console.log("未知响应格式:", JSON.stringify(response.data));
      throw new Error("AI返回格式错误");
    }

    console.log("AI原始返回:", aiContent);

    // 提取JSON
    let jsonStr = aiContent;
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    const aiResult = JSON.parse(jsonStr);
    
    if (!aiResult.tasks || aiResult.tasks.length === 0) {
      throw new Error("AI未返回tasks");
    }
    
    console.log(`成功生成${aiResult.tasks.length}天计划`);
    
    // ========== 关键修改：转换为前端期望的格式 ==========
    const formattedTasks = aiResult.tasks.map(task => ({
      day: task.day,
      focus: task.content,      // content → focus
      minutes: task.duration,   // duration → minutes
      deliverable: task.content // 新增 deliverable 字段
    }));
    
    const formattedResult = {
      summary: aiResult.summary,
      tips: aiResult.tips,
      tasks: formattedTasks
    };
    
    return res.json(success(formattedResult, "计划生成成功"));
    
  } catch (aiErr) {
    console.error("AI调用失败:", aiErr.message);
    if (aiErr.response) {
      console.error("API错误详情:", aiErr.response.data);
    }
    
    // ========== 兜底计划（也转换为前端期望的格式）==========
    const stageNames = level === 'beginner' ? ['基础入门', '核心学习', '实战练习', '综合提升'] :
                       level === 'intermediate' ? ['巩固基础', '进阶提升', '专项突破', '高阶应用'] :
                       ['深度理解', '高级技巧', '项目实战', '专家级训练'];
    
    const tasks = [];
    const maxDays = Math.min(periodDays, 14);
    const stageSize = Math.ceil(maxDays / stageNames.length);
    
    for (let i = 0; i < maxDays; i++) {
      const day = i + 1;
      const stageIndex = Math.floor(i / stageSize);
      const stage = stageNames[Math.min(stageIndex, stageNames.length - 1)];
      const dayInStage = i % stageSize + 1;
      
      let content = '';
      if (day <= periodDays * 0.3) {
        content = `${stage}：学习${goalTitle}基础概念和入门知识第${dayInStage}天`;
      } else if (day <= periodDays * 0.6) {
        content = `${stage}：学习${goalTitle}核心技能和重点难点第${dayInStage}天`;
      } else if (day <= periodDays * 0.8) {
        content = `${stage}：学习${goalTitle}实战项目和案例分析第${dayInStage}天`;
      } else {
        content = `${stage}：学习${goalTitle}综合复习和查漏补缺第${dayInStage}天`;
      }
      
      tasks.push({
        day: day,
        content: content,
        duration: dailyMinutes
      });
    }
    
    // 转换为前端期望的格式
    const formattedFallbackTasks = tasks.map(task => ({
      day: task.day,
      focus: task.content,
      minutes: task.duration,
      deliverable: task.content
    }));
    
    const fallbackPlan = {
      summary: `为您定制了${periodDays}天的《${goalTitle}》学习计划，每天学习${dailyMinutes}分钟，${level === 'beginner' ? '适合零基础入门' : level === 'intermediate' ? '适合有一定基础进阶' : '适合高手强化提升'}。`,
      tips: [
        "🎯 每天固定时间学习，养成习惯",
        "📝 做笔记并定期复习，加深记忆",
        "💬 加入学习社群，互相督促",
        "📊 每周日复盘，调整下周计划",
        "🏆 完成阶段性目标后给自己奖励"
      ],
      tasks: formattedFallbackTasks
    };
    
    return res.json(success(fallbackPlan, "计划生成成功（AI服务暂时不可用，使用默认计划）"));
  }
};