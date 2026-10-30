import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '../features/home/HomePage.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage, meta: { title: 'Kirjavõlu' } },
  {
    path: '/lapsed',
    name: 'children',
    component: () => import('../features/children/ChildrenPage.vue'),
    meta: { title: 'Lapsed' },
  },
  {
    path: '/loo',
    name: 'create',
    component: () => import('../features/creation/CreatePage.vue'),
    meta: { title: 'Loo uus' },
  },
  {
    path: '/looming/:id',
    name: 'preview',
    component: () => import('../features/preview/PreviewPage.vue'),
    props: true,
    meta: { title: 'Eelvaade' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : ''
  document.title = title && title !== 'Kirjavõlu' ? `${title} · Kirjavõlu` : 'Kirjavõlu'
})
