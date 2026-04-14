<template>
  <section class="grid-2">
    <article>
      <div class="card section-header" style="margin-bottom: 12px">
        <h2 class="card-title" style="margin: 0">{{ currentYear }} 年 {{ currentMonth }} 月</h2>
        <div class="inline-actions">
          <button class="button-secondary" @click="changeMonth(-1)">上月</button>
          <button class="button-secondary" @click="changeMonth(1)">下月</button>
        </div>
      </div>
      <MonthGrid :days="displayDays" :selected-date="selectedDate" @select-date="onSelectDate" />
    </article>

    <article class="card">
      <div class="section-header">
        <h2 class="card-title" style="margin: 0">{{ selectedDate }} 任务</h2>
        <div class="inline-actions">
          <button class="button-secondary" :disabled="tasksStore.dayTasks.length === 0" @click="setAllForDay(true)">
            全部完成
          </button>
          <button class="button-secondary" :disabled="tasksStore.dayTasks.length === 0" @click="setAllForDay(false)">
            全部取消
          </button>
          <button class="button-secondary" @click="tasksStore.loadDay(selectedDate)">刷新</button>
        </div>
      </div>

      <div class="card" style="margin-bottom: 12px">
        <p class="muted">当日完成率</p>
        <p class="kpi-number" style="font-size: 26px">{{ dayCompletionRate }}%</p>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${dayCompletionRate}%` }"></div>
        </div>
      </div>

      <div class="empty" v-if="tasksStore.dayTasks.length === 0">当天暂无任务，尝试创建新目标。</div>
      <ul v-else style="margin: 0; padding: 0">
        <li v-for="task in tasksStore.dayTasks" :key="task.id" class="list-item-card">
          <strong>{{ task.title }}</strong>
          <div class="muted">计划：{{ task.plannedAmount }} {{ unitLabel(task.title) }}</div>
          <div class="muted">完成：{{ task.completedAmount }}</div>
          <button class="button-primary" @click="toggleCheckin(task.id, !task.isCompleted)">
            {{ task.isCompleted ? "取消完成" : "完成打卡" }}
          </button>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import MonthGrid from "@/components/calendar/MonthGrid.vue";
import { useTasksStore } from "@/stores/tasks";

const tasksStore = useTasksStore();

const cursor = ref(dayjs().startOf("month"));
const currentYear = computed(() => cursor.value.year());
const currentMonth = computed(() => cursor.value.month() + 1);

const selectedDate = ref(dayjs().format("YYYY-MM-DD"));

const summaryMap = computed(() => {
  const map = new Map<string, { totalTasks: number; completedTasks: number }>();
  tasksStore.monthDays.forEach((item) => {
    map.set(item.date, { totalTasks: item.totalTasks, completedTasks: item.completedTasks });
  });
  return map;
});

const displayDays = computed(() => {
  const firstDay = cursor.value.startOf("month");
  const daysInMonth = firstDay.daysInMonth();
  const leading = (firstDay.day() + 6) % 7;

  const cells: Array<{
    key: string;
    date: string;
    dayOfMonth: number | null;
    totalTasks: number;
    completedTasks: number;
    isPadding: boolean;
    isToday: boolean;
  }> = [];

  for (let i = 0; i < leading; i += 1) {
    cells.push({
      key: `prev-${i}`,
      date: "",
      dayOfMonth: null,
      totalTasks: 0,
      completedTasks: 0,
      isPadding: true,
      isToday: false
    });
  }

  for (let i = 0; i < daysInMonth; i += 1) {
    const date = firstDay.add(i, "day").format("YYYY-MM-DD");
    const summary = summaryMap.value.get(date);
    cells.push({
      key: date,
      date,
      dayOfMonth: i + 1,
      totalTasks: summary?.totalTasks ?? 0,
      completedTasks: summary?.completedTasks ?? 0,
      isPadding: false,
      isToday: date === dayjs().format("YYYY-MM-DD")
    });
  }

  while (cells.length % 7 !== 0) {
    const index = cells.length;
    cells.push({
      key: `next-${index}`,
      date: "",
      dayOfMonth: null,
      totalTasks: 0,
      completedTasks: 0,
      isPadding: true,
      isToday: false
    });
  }

  return cells;
});

const dayCompletionRate = computed(() => {
  const list = tasksStore.dayTasks;
  if (!list.length) return 0;
  const completed = list.filter((item) => item.isCompleted).length;
  return Math.round((completed / list.length) * 100);
});

onMounted(async () => {
  await tasksStore.loadMonth(currentYear.value, currentMonth.value);
  await tasksStore.loadDay(selectedDate.value);
  await tasksStore.loadOverview();
});

async function onSelectDate(date: string) {
  if (!date) return;
  selectedDate.value = date;
  await tasksStore.loadDay(date);
}

async function toggleCheckin(taskId: string, isCompleted: boolean) {
  await tasksStore.checkin(taskId, { isCompleted });
  await Promise.all([
    tasksStore.loadDay(selectedDate.value),
    tasksStore.loadMonth(currentYear.value, currentMonth.value),
    tasksStore.loadOverview()
  ]);
}

async function changeMonth(offset: number) {
  cursor.value = cursor.value.add(offset, "month").startOf("month");
  if (!selectedDate.value.startsWith(cursor.value.format("YYYY-MM"))) {
    selectedDate.value = cursor.value.format("YYYY-MM-01");
  }
  await Promise.all([
    tasksStore.loadMonth(currentYear.value, currentMonth.value),
    tasksStore.loadDay(selectedDate.value)
  ]);
}

async function setAllForDay(isCompleted: boolean) {
  await Promise.all(tasksStore.dayTasks.map((task) => tasksStore.checkin(task.id, { isCompleted })));
  await Promise.all([
    tasksStore.loadDay(selectedDate.value),
    tasksStore.loadMonth(currentYear.value, currentMonth.value),
    tasksStore.loadOverview()
  ]);
}

function unitLabel(title: string) {
  if (title.includes("hour") || title.includes("小时")) return "hour";
  return "";
}
</script>
