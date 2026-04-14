<template>
  <div class="calendar-grid card">
    <div class="week-head" v-for="name in weekNames" :key="name">{{ name }}</div>
    <button
      v-for="day in days"
      :key="day.key"
      type="button"
      class="day-cell"
      :class="{ active: day.date === selectedDate, 'day-padding': day.isPadding, 'day-today': day.isToday }"
      :disabled="day.isPadding"
      @click="$emit('selectDate', day.date)"
    >
      <div v-if="!day.isPadding">
        <div class="day-number">{{ day.dayOfMonth }}</div>
        <small class="muted">{{ day.completedTasks }}/{{ day.totalTasks }}</small>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  days: Array<{
    key: string;
    date: string;
    dayOfMonth: number | null;
    totalTasks: number;
    completedTasks: number;
    isPadding: boolean;
    isToday: boolean;
  }>;
  selectedDate: string;
}>();

defineEmits<{
  (e: "selectDate", date: string): void;
}>();

const weekNames = ["一", "二", "三", "四", "五", "六", "日"];
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 9px;
}

.week-head {
  text-align: center;
  font-weight: 700;
  color: #446187;
  font-size: 13px;
}

.day-cell {
  border: 1px solid #d3deee;
  border-radius: 14px;
  min-height: 82px;
  background: linear-gradient(150deg, #ffffff, #f9fcff);
  text-align: left;
  padding: 9px;
  cursor: pointer;
  transition: 0.18s ease;
}

.day-number {
  font-weight: 700;
  color: #1f4872;
}

.day-cell:hover {
  border-color: #8fb7dc;
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(20, 58, 102, 0.11);
}

.day-cell.active {
  border-color: #0e6e7d;
  box-shadow: 0 0 0 2px rgba(14, 110, 125, 0.2);
  background: linear-gradient(120deg, #f6fcff, #edfaf8);
}

.day-today {
  border-color: #f2a22a;
}

.day-padding {
  border-style: dashed;
  background: #f9fbff;
  cursor: default;
}
</style>
