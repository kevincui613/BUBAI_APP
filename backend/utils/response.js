// 统一成功响应
exports.success = (data = null, message = "成功") => {
  return {
    code: 2000,
    message,
    data
  };
};

// 统一错误响应（严格按文档错误码）
exports.error = (code = 5000, message = "服务器内部错误") => {
  return {
    code,
    message,
    data: null
  };
};

// 常用错误码封装
exports.errors = {
  // 4001: 参数错误
  PARAM_ERROR: (msg = "参数错误") => exports.error(4001, msg),
  // 4002: 未授权
  UNAUTHORIZED: (msg = "未登录或token失效") => exports.error(4002, msg),
  // 4003: 禁止访问
  FORBIDDEN: (msg = "无权限访问") => exports.error(4003, msg),
  // 4040: 资源不存在
  NOT_FOUND: (msg = "资源不存在") => exports.error(4040, msg),
  // 5000: 服务器错误
  SERVER_ERROR: (msg = "服务器内部错误") => exports.error(5000, msg)
};