const { success, errors } = require("../utils/response");
const mock = require("../mockData/index");

// 计算两个日期之间的天数差
function getDaysBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

// 创建目标
exports.createGoal = async (req, res) => {
  try {
    const { title, description, targetTotal, unit, startDate, endDate } = req.body;
    if (!title) return res.json(errors.PARAM_ERROR("目标标题不能为空"));

    const newGoal = {
      id: mock.goals.length + 1,
      userId: req.user.id,
      title,
      description: description || "",
      targetTotal: targetTotal || 0,
      unit: unit || "天",
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || "",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mock.goals.push(newGoal);

    // 自动创建每日任务
    if (startDate && endDate) {
      const days = getDaysBetweenDates(startDate, endDate);
      const dailyAmount = targetTotal > 0 ? Math.ceil(targetTotal / days) : 60;
      
      let currentDate = new Date(startDate);
      const end = new Date(endDate);
      
      while (currentDate <= end) {
        const taskDate = currentDate.toISOString().split('T')[0];
        const taskTitle = `${title} - 第${currentDate.getDate()}天`;
        
        const newTask = {
          id: mock.tasks.length + 1,
          goalId: newGoal.id,
          taskDate: taskDate,
          title: taskTitle,
          plannedAmount: dailyAmount,
          completedAmount: 0,
          isCompleted: false,
          note: "",
          userId: req.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mock.tasks.push(newTask);
        
        // 移动到下一天
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`为目标 ${title} 自动创建了 ${days} 天的任务`);
    }

    return res.json(success(newGoal, "目标创建成功"));
  } catch (err) {
    console.error("创建目标错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取目标列表
exports.getGoals = async (req, res) => {
  try {
    const { status } = req.query;
    let goals = mock.goals.filter(g => g.userId === req.user.id);

    if (status) {
      goals = goals.filter(g => g.status === status);
    }

    return res.json(success(goals));
  } catch (err) {
    console.error("获取目标列表错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 获取单个目标详情
exports.getGoalById = async (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const goal = mock.goals.find(g => g.id === goalId && g.userId === req.user.id);
    
    if (!goal) {
      return res.json(errors.NOT_FOUND("目标不存在"));
    }
    
    return res.json(success(goal));
  } catch (err) {
    console.error("获取目标详情错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 更新目标
exports.updateGoal = async (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const { title, description, targetTotal, unit, startDate, endDate, status } = req.body;
    
    const goalIndex = mock.goals.findIndex(g => g.id === goalId && g.userId === req.user.id);
    
    if (goalIndex === -1) {
      return res.json(errors.NOT_FOUND("目标不存在"));
    }
    
    const goal = mock.goals[goalIndex];
    
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetTotal) goal.targetTotal = targetTotal;
    if (unit) goal.unit = unit;
    if (startDate) goal.startDate = startDate;
    if (endDate) goal.endDate = endDate;
    if (status) goal.status = status;
    goal.updatedAt = new Date().toISOString();
    
    mock.goals[goalIndex] = goal;
    
    return res.json(success(goal, "目标更新成功"));
  } catch (err) {
    console.error("更新目标错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};

// 删除目标
exports.deleteGoal = async (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const goalIndex = mock.goals.findIndex(g => g.id === goalId && g.userId === req.user.id);
    
    if (goalIndex === -1) {
      return res.json(errors.NOT_FOUND("目标不存在"));
    }
    
    // 同时删除该目标下的所有任务
    const taskIdsToDelete = mock.tasks
      .filter(t => t.goalId === goalId && t.userId === req.user.id)
      .map(t => t.id);
    
    mock.tasks = mock.tasks.filter(t => !taskIdsToDelete.includes(t.id));
    
    mock.goals.splice(goalIndex, 1);
    
    return res.json(success(null, "目标删除成功"));
  } catch (err) {
    console.error("删除目标错误:", err);
    return res.json(errors.SERVER_ERROR());
  }
};