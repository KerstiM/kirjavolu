import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '../features/home/HomePage.vue'

/**
 * Two main journeys: the home page ("/") with every kind of creation, and the Christmas
 * letters ("/joulukirjad"). The earlier test views (/uus-disain…, /ud2…, /ud3) still answer,
 * so shared links and Stripe return addresses keep working, but nothing links to them any
 * more; docs/route-migration.md has the plan for redirecting them once this is accepted.
 */
const Create = () => import('../features/creation/CreatePage.vue')
const Preview = () => import('../features/preview/PreviewPage.vue')
const Children = () => import('../features/children/ChildrenPage.vue')
const Sample = () => import('../features/home/DemoPage.vue')
const MyCreations = () => import('../features/home/MyCreationsPage.vue')
const Pass = () => import('../features/pass/PassPage.vue')
const Terms = () => import('../features/legal/TermsPage.vue')
const Privacy = () => import('../features/legal/PrivacyPage.vue')
const ChristmasStart = () => import('../features/christmas/ChristmasStart.vue')
const ChristmasLetters = () => import('../features/christmas/ChristmasLetters.vue')
const LegacyHome = () => import('../features/home/new/HomeNewPage.vue')

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage, meta: { title: 'Kirjavõlu' } },
  { path: '/joulukirjad', name: 'christmas', component: ChristmasStart, meta: { title: 'Jõulukirjad' } },
  { path: '/joulukirjad/:id', name: 'christmas-letters', component: ChristmasLetters, props: true, meta: { title: 'Jõulukirjad' } },
  { path: '/loo', name: 'create', component: Create, meta: { title: 'Loo uus' } },
  { path: '/looming/:id', name: 'preview', component: Preview, props: true, meta: { title: 'Eelvaade' } },
  { path: '/minu', name: 'my-creations', component: MyCreations, meta: { title: 'Minu kirjad' } },
  { path: '/lapsed', name: 'children', component: Children, meta: { title: 'Lapsed' } },
  { path: '/naide', name: 'sample', component: Sample, meta: { title: 'Näide' } },
  // Jõulupass: the code, what is left, and typing a code in on another device.
  { path: '/joulupass', name: 'season-pass', component: Pass, meta: { title: 'Jõulupass' } },
  { path: '/tingimused', name: 'terms', component: Terms, meta: { title: 'Müügitingimused' } },
  { path: '/privaatsus', name: 'privacy', component: Privacy, meta: { title: 'Privaatsus' } },
  {
    path: '/kolin',
    name: 'transfer',
    component: () => import('../features/moving/TransferPage.vue'),
    meta: { title: 'Andmete toomine' },
  },

  // --- earlier test views, kept answering until the redirects are approved ---------------
  // Their own home pages stay as they were, for comparison.
  { path: '/uus-disain', name: 'home-new', component: LegacyHome, meta: { title: 'Uus disain' } },
  { path: '/ud2', name: 'ud2', component: LegacyHome, props: { short: true }, meta: { title: 'Uus disain' } },
  // /ud3 grew into the home page.
  { path: '/ud3', name: 'ud3', component: HomePage, meta: { title: 'Kirjavõlu' } },
  // The same pages as the main paths: old links and Stripe's way back after paying still land.
  { path: '/uus-disain/loo', name: 'create-new', component: Create, meta: { title: 'Loo uus' } },
  { path: '/uus-disain/looming/:id', name: 'preview-new', component: Preview, props: true, meta: { title: 'Eelvaade' } },
  { path: '/uus-disain/lapsed', name: 'children-new', component: Children, meta: { title: 'Lapsed' } },
  { path: '/uus-disain/naide', name: 'sample-new', component: Sample, meta: { title: 'Näide' } },
  { path: '/uus-disain/joulupass', name: 'season-pass-new', component: Pass, meta: { title: 'Jõulupass' } },
  { path: '/uus-disain/tingimused', name: 'terms-new', component: Terms, meta: { title: 'Müügitingimused' } },
  { path: '/uus-disain/privaatsus', name: 'privacy-new', component: Privacy, meta: { title: 'Privaatsus' } },
  { path: '/ud2/alusta', name: 'ud2-start', component: ChristmasStart, meta: { title: 'Jõulukirjad' } },
  { path: '/ud2/kirjad/:id', name: 'ud2-letters', component: ChristmasLetters, props: true, meta: { title: 'Jõulukirjad' } },
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
