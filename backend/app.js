const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean)
  : true;

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// 关键：挂载路由（根据你的访问路径选择一种）
app.use('/api', require('./routes/index'));  // 如果访问路径带 /api 前缀
// 或者
// app.use('/', require('./routes/index'));   // 如果访问路径不带 /api 前缀

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 4040, message: "接口不存在", data: null });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`服务已启动：http://localhost:${PORT}`);
});