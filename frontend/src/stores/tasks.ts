import { defineStore } from "pinia";
import { checkinTask, fetchDayTasks, fetchMonthCalendar, fetchOverview } from "@/api/tasks";
import type { CalendarDaySummary, DailyTask, StatsOverview } from "@/types";

interface TasksState {
  monthDays: CalendarDaySummary[];
  dayTasks: DailyTask[];
  overview: StatsOverview | null;
}

export const useTasksStore = defineStore("tasks", {
  state: (): TasksState => ({
    monthDays: [],
    dayTasks: [],
    overview: null
  }),
  actions: {
    async loadMonth(year: number, month: number) {
      try {
        const days = await fetchMonthCalendar(year, month);
        this.monthDays = Array.isArray(days) ? [...days] : [];
        console.log("加载日历完成，天数:", this.monthDays.length);
      } catch (error) {
        console.error("加载日历失败:", error);
        this.monthDays = [];
      }
    },
    async loadDay(date: string) {
      try {
        const tasks = await fetchDayTasks(date);
        this.dayTasks = Array.isArray(tasks) ? [...tasks] : [];
        console.log(`加载${date}任务完成，数量:`, this.dayTasks.length);
      } catch (error) {
        console.error("加载任务失败:", error);
        this.dayTasks = [];
      }
    },
    async loadOverview() {
      try {
        this.overview = await fetchOverview();
        console.log("加载统计完成:", this.overview);
      } catch (error) {
        console.error("加载统计失败:", error);
        this.overview = null;
      }
    },
    async checkin(taskId: string, payload: { isCompleted: boolean; completedAmount?: number; note?: string }) {
      try {
        const updated = await checkinTask(taskId, payload);
        // 更新本地任务列表
        this.dayTasks = this.dayTasks.map((task) => 
          task.id === taskId ? { ...task, ...updated, isCompleted: payload.isCompleted } : task
        );
        // 同时更新日历中的完成状态
        const taskDate = this.dayTasks.find(t => t.id === taskId)?.taskDate;
        if (taskDate) {
          const dayIndex = this.monthDays.findIndex(d => d.date === taskDate);
          if (dayIndex !== -1) {
            const day = this.monthDays[dayIndex];
            const newCompleted = payload.isCompleted 
              ? day.completedTasks + 1 
              : day.completedTasks - 1;
            this.monthDays[dayIndex] = {
              ...day,
              completedTasks: Math.max(0, newCompleted)
            };
          }
        }
        console.log("打卡成功:", taskId);
      } catch (error) {
        console.error("打卡失败:", error);
        throw error;
      }
    }
  }
});