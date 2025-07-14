import { mixin } from '@/mixins'
const ProfileRegister = () => import('./pages/ProfileRegister')
const ProfilePoints = () => import('./pages/ProfilePoints')
const ModalAlterPassword = () => import('./pages/ModalAlterPassword')

export default [
  {
    name: 'profile',
    path: '/profile',
    redirect: { name: 'profile.register' },
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'profile.register',
    path: '/profile/register',
    component: ProfileRegister,
    meta: {
      requiresAuth: true,
      group: 'profile',
    },
    children: [
      {
        name: 'profile.register.password',
        path: 'password',
        component: ModalAlterPassword,
        meta: {
          editing: true,
          modalCloseLink: { name: 'profile.register' },
        },
      },
    ],
  },
  {
    name: 'profile.points',
    path: '/profile/points',
    component: ProfilePoints,
    beforeEnter: (to, from, next) => {
      mixin.methods.isGamificationEnable() ? next() : next(from)
    },
    meta: {
      requiresAuth: true,
      group: 'profile',
    },
  },
]
