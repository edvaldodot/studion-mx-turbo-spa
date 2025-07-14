const RankingList = () => import('./pages/RankingList')

export default [
  {
    name: 'ranking.list',
    path: '/ranking',
    component: RankingList,
    meta: { requiresAuth: true }
  }
]
