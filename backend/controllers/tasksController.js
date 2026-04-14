const { success, errors } = require("../utils/response");
const mock = require("../mockData/index");

// 创建任务
exports.createTask = async (req, res) => {
  try {
    const { goalId, taskDate, title, plannedAmount, note } = req.body;
    if (!title || !taskDate) {
      return res.json(errors.PARAM_ERROR("标题和日期不能为空"));
    }

    const newTask = {
      id: mock.tasks.length + 1,
      goalId: goalId || null,
      taskDate: taskDate,
      title: title,
      plannedAmount: plannedAmount || 0,
      completedAmount: 0,
      isCompleted: false,
      note: note || "",
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mock.tasks.push(newTask);
    console.log("创建任务成功:", newTask);

    return res.json(success(newTask, "任务创建成功"));
  } catch (err) {
    console.error("创建任务错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取任务列表
exports.getTasks = async (req, res) => {
  try {
    const { goalId, startDate, endDate } = req.query;
    let tasks = mock.tasks.filter(t => t.userId === req.user.id);

    if (goalId) {
      tasks = tasks.filter(t => t.goalId === parseInt(goalId));
    }
    if (startDate) {
      tasks = tasks.filter(t => t.taskDate >= startDate);
    }
    if (endDate) {
      tasks = tasks.filter(t => t.taskDate <= endDate);
    }

    return res.json(success(tasks));
  } catch (err) {
    console.error("获取任务列表错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取单个任务
exports.getTaskById = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = mock.tasks.find(t => t.id === taskId && t.userId === req.user.id);
    
    if (!task) {
      return res.json(errors.NOT_FOUND("任务不存在"));
    }
    
    return res.json(success(task));
  } catch (err) {
    console.error("获取任务详情错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 更新任务
exports.updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, plannedAmount, note, taskDate } = req.body;
    
    const taskIndex = mock.tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
    if (taskIndex === -1) {
      return res.json(errors.NOT_FOUND("任务不存在"));
    }
    
    const task = mock.tasks[taskIndex];
    if (title) task.title = title;
    if (plannedAmount) task.plannedAmount = plannedAmount;
    if (note !== undefined) task.note = note;
    if (taskDate) task.taskDate = taskDate;
    task.updatedAt = new Date().toISOString();
    
    mock.tasks[taskIndex] = task;
    
    return res.json(success(task, "任务更新成功"));
  } catch (err) {
    console.error("更新任务错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 删除任务
exports.deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = mock.tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
    
    if (taskIndex === -1) {
      return res.json(errors.NOT_FOUND("任务不存在"));
    }
    
    mock.tasks.splice(taskIndex, 1);
    
    return res.json(success(null, "任务删除成功"));
  } catch (err) {
    console.error("删除任务错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取月视图日历
exports.getMonthCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log("=== 获取日历 ===");
    console.log("参数:", { year, month });
    console.log("当前用户ID:", req.user.id);
    
    // 过滤当前用户的任务
    let tasks = mock.tasks.filter(t => t.userId === req.user.id);
    console.log("用户任务数量:", tasks.length);
    
    // 如果有年月参数，按年月过滤
    if (year && month) {
      const monthStr = String(month).padStart(2, "0");
      tasks = tasks.filter(t => {
        const taskDate = t.taskDate || t.date;
        if (!taskDate) return false;
        return taskDate.startsWith(`${year}-${monthStr}`);
      });
      console.log("过滤后任务数量:", tasks.length);
    }
    
    // 按日期分组
    const calendarMap = new Map();
    tasks.forEach(task => {
      const taskDate = task.taskDate || task.date;
      if (!taskDate) return;
      
      if (!calendarMap.has(taskDate)) {
        calendarMap.set(taskDate, []);
      }
      calendarMap.get(taskDate).push(task);
    });
    
    // 转换为数组格式
    const result = Array.from(calendarMap.entries()).map(([date, tasks]) => ({
      date,
      tasks,
      completedCount: tasks.filter(t => t.isCompleted).length,
      totalCount: tasks.length
    }));
    
    console.log("返回日历数据条数:", result.length);
    return res.json(success(result));
  } catch (err) {
    console.error("获取日历错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 任务打卡
exports.completeTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { completedAmount } = req.body;
    
    const taskIndex = mock.tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
    if (taskIndex === -1) {
      return res.json(errors.NOT_FOUND("任务不存在"));
    }
    
    const task = mock.tasks[taskIndex];
    task.completedAmount = completedAmount || task.plannedAmount;
    task.isCompleted = task.completedAmount >= task.plannedAmount;
    task.updatedAt = new Date().toISOString();
    
    mock.tasks[taskIndex] = task;
    
    return res.json(success(task, "打卡成功"));
  } catch (err) {
    console.error("打卡错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取数据统计
exports.getStats = async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const userTasks = mock.tasks.filter(t => t.userId === req.user.id);
    
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    // 计算连续打卡天数（简化版）
    let streakDays = 0;
    const today = new Date().toISOString().split('T')[0];
    const completedDates = [...new Set(userTasks.filter(t => t.isCompleted).map(t => t.taskDate || t.date))].sort();
    
    for (let i = completedDates.length - 1; i >= 0; i--) {
      const date = completedDates[i];
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - (completedDates.length - 1 - i));
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      if (date === expectedDateStr) {
        streakDays++;
      } else {
        break;
      }
    }
    
    const stats = {
      totalTasks,
      completedTasks,
      completionRate: parseFloat(completionRate),
      streakDays,
      weeklyProgress: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        completed: Math.floor(Math.random() * 5)
      }))
    };
    
    return res.json(success(stats));
  } catch (err) {
    console.error("获取统计错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};