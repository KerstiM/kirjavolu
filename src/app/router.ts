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
    path: '/uus-disain/looming/:id',
    name: 'preview-new',
    component: () => import('../features/preview/PreviewPage.vue'),
    props: (route) => ({ id: route.params.id, design: 'new' }),
    meta: { title: 'Eelvaade' },
  },
  {
    path: '/uus-disain/lapsed',
    name: 'children-new',
    component: () => import('../features/children/ChildrenPage.vue'),
    props: { design: 'new' },
    meta: { title: 'Lapsed' },
  },
  {
    path: '/uus-disain/naide',
    name: 'sample-new',
    component: () => import('../features/home/DemoPage.vue'),
    props: { design: 'new' },
    meta: { title: 'Näide' },
  },
  {
    // Jõulupass: Stripe returns here after payment, and a code can be typed in on another device.
    path: '/uus-disain/joulupass',
    name: 'season-pass-new',
    component: () => import('../features/pass/PassPage.vue'),
    meta: { title: 'Jõulupass' },
  },
  {
    // The short Christmas journey, tried out next to /uus-disain: who for, the free
    // letters at once, and making them personal right beside them.
    path: '/ud2',
    name: 'ud2',
    component: () => import('../features/ud2/Ud2Start.vue'),
    meta: { title: 'Jõulukirjad' },
  },
  {
    path: '/ud2/kirjad/:id',
    name: 'ud2-letters',
    component: () => import('../features/ud2/Ud2Letters.vue'),
    props: true,
    meta: { title: 'Jõulukirjad' },
  },
  {
    path: '/uus-disain/tingimused',
    name: 'terms-new',
    component: () => import('../features/legal/TermsPage.vue'),
    props: { design: 'new' },
    meta: { title: 'Müügitingimused' },
  },
  {
    path: '/uus-disain/privaatsus',
    name: 'privacy-new',
    component: () => import('../features/legal/PrivacyPage.vue'),
    props: { design: 'new' },
    meta: { title: 'Privaatsus' },
  },
  {
    path: '/tingimused',
    name: 'terms',
    component: () => import('../features/legal/TermsPage.vue'),
    meta: { title: 'Müügitingimused' },
  },
  {
    path: '/privaatsus',
    name: 'privacy',
    component: () => import('../features/legal/PrivacyPage.vue'),
    meta: { title: 'Privaatsus' },
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
