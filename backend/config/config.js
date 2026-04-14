require('dotenv').config();

module.exports = {
  // JWT 密钥（自己改一个复杂的）
  JWT_SECRET: process.env.JWT_SECRET || "bubai-ai-secret-key-2025",
  // 通义千问 API 配置
  QWEN_API_KEY: process.env.QWEN_API_KEY || "sk-283bcc9f443b4bac9e2fe98901f66e98",
  QWEN_API_URL: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
  // 服务端口
  PORT: process.env.PORT || 3000,
  // 模拟数据开关（开发时开，上线关）
  USE_MOCK: true
};