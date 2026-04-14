import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/dashboard/DashboardView.vue";
import GoalsView from "@/views/goals/GoalsView.vue";
import CalendarView from "@/views/calendar/CalendarView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";
import NotFoundView from "@/views/system/NotFoundView.vue";
import FriendsView from "@/views/social/FriendsView.vue";
import CirclesView from "@/views/social/CirclesView.vue";
import TeamsView from "@/views/social/TeamsView.vue";
import AiPlannerView from "@/views/ai/AiPlannerView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/dashboard", component: DashboardView, meta: { requiresAuth: true } },
    { path: "/goals", component: GoalsView, meta: { requiresAuth: true } },
    { path: "/calendar", component: CalendarView, meta: { requiresAuth: true } },
    { path: "/social/friends", component: FriendsView, meta: { requiresAuth: true } },
    { path: "/social/circles", component: CirclesView, meta: { requiresAuth: true } },
    { path: "/social/teams", component: TeamsView, meta: { requiresAuth: true } },
    { path: "/ai/planner", component: AiPlannerView, meta: { requiresAuth: true } },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    { path: "/:pathMatch(.*)*", component: NotFoundView }
  ]
});

router.beforeEach((to) => {
  const token = localStorage.getItem("accessToken");
  if (to.meta.requiresAuth && !token) {
    return "/login";
  }
  if ((to.path === "/login" || to.path === "/register") && token) {
    return "/dashboard";
  }
  return true;
});

export default router;
