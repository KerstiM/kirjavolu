import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '../features/home/HomePage.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage, meta: { title: 'Kirjavõlu' } },
  {
    // Test view of the new home page design; "/" keeps the current one until it is chosen.
    path: '/uus-disain',
    name: 'home-new',
    component: () => import('../features/home/new/HomeNewPage.vue'),
    meta: { title: 'Uus disain' },
  },
  {
    // The same wizard in the new design, so the whole new journey can be tried out.
    path: '/uus-disain/loo',
    name: 'create-new',
    component: () => import('../features/creation/CreatePage.vue'),
    props: { design: 'new' },
    meta: { title: 'Loo uus' },
  },
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
    path: '/naide',
    name: 'sample',
    component: () => import('../features/home/DemoPage.vue'),
    meta: { title: 'Näide' },
  },
  {
    path: '/kolin',
    name: 'transfer',
    component: () => import('../features/moving/TransferPage.vue'),
    meta: { title: 'Andmete toomine' },
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
