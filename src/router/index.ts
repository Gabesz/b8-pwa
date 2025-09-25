import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('../pages/HomePage.vue') },
  { path: '/jatekosok', name: 'players', component: () => import('../pages/PlayersPage.vue') },
  { path: '/versenyek', name: 'tournaments', component: () => import('../pages/TournamentsPage.vue') }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});




