const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mock = require("../mockData");
const { JWT_SECRET } = require("../config/config");
const { success, errors } = require("../utils/response");

// 登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json(errors.PARAM_ERROR("邮箱和密码不能为空"));
    }

    const user = mock.users.find((u) => u.email === email);
    if (!user) {
      return res.json(errors.PARAM_ERROR("账号或密码错误"));
    }

    // 明文密码验证
    const isMatch = (password === user.password);
    
    if (!isMatch) {
      return res.json(errors.PARAM_ERROR("账号或密码错误"));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json(
      success(
        {
          accessToken: token,
          user: { id: user.id, email: user.email, nickname: user.nickname },
        },
        "登录成功"
      )
    );
  } catch (error) {
    console.error(error);
    return res.json(errors.SERVER_ERROR());
  }
};

// 注册
exports.register = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) {
      return res.json(errors.PARAM_ERROR("信息不能为空"));
    }

    const exist = mock.users.find((u) => u.email === email);
    if (exist) {
      return res.json(errors.PARAM_ERROR("邮箱已注册"));
    }

    // 直接存明文密码
    const hashedPwd = password;
    
    const newUser = {
      id: mock.users.length + 1,
      email,
      nickname,
      password: hashedPwd,
    };
    mock.users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json(
      success(
        {
          accessToken: token,
          user: { id: newUser.id, email: newUser.email, nickname: newUser.nickname },
        },
        "注册成功"
      )
    );
  } catch (error) {
    console.error(error);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取用户信息
exports.getMe = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.json(errors.UNAUTHORIZED());

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mock.users.find((u) => u.id === decoded.id);
    if (!user) return res.json(errors.UNAUTHORIZED());

    return res.json(
      success(
        {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
        },
        "ok"
      )
    );
  } catch (err) {
    return res.json(errors.UNAUTHORIZED());
  }
};