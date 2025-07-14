import store from '@/store'
import config from '@/config'
import beforeEnterSignin from '@/router/beforeEnterSignin'

const { REDIRECT_URL, KEYCLOAK_ENABLED, PORTAL_CONFIGS } = config

const Signin = () => import('./pages/Signin')
const SigninUserBlocked = () => import('./pages/SigninUserBlocked')
const Signup = () => import('./pages/Signup')
const Oauth = () => import('./pages/OAuth')
const OauthCallback = () => import('./pages/OAuthCallback')
const Autologin = () => import('./pages/Autologin')
const SignupActivateEmail = () => import('./pages/SignupActivateEmail')
const SignupActivate = () => import('./pages/SignupActivate')
const PasswordRecovery = () => import('./pages/PasswordRecovery')
const PasswordRecoveryConfirm = () => import('./pages/PasswordRecoveryConfirm')
const UsernameRecovery = () => import('./pages/UsernameRecovery')
const UsernameRecoveryConfirm = () => import('./pages/UsernameRecoveryConfirm')
const PasswordReset = () => import('./pages/PasswordReset')
const PasswordResetConfirm = () => import('./pages/PasswordResetConfirm')
const ChangeProfile = () => import('./pages/ChangeProfile')

export default [
  {
    name: 'auth.signin',
    path: '/auth/signin/:token?/:refreshToken?/:sessionUuid?/:classroomToolOrTopicType?/:topicId?',
    component: Signin,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    },
    beforeEnter: beforeEnterSignin
  },
  {
    name: 'auth.blocked',
    path: '/auth/blocked/:time',
    component: SigninUserBlocked,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    }
  },
  {
    name: 'auth.autologin',
    path: '/auth/autologin',
    component: Autologin,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    }
  },
  {
    name: 'auth.oauth',
    path: '/auth/oauth/:connection',
    meta: {
      requiresAuth: false,
      hideNavbar: true
    },
    component: Oauth
  },
  {
    name: 'auth.oauth.callback',
    path: '/auth/oauth-callback',
    meta: {
      requiresAuth: false,
      hideNavbar: true
    },
    component: OauthCallback
  },
  {
    name: 'auth.activate',
    path: '/auth/activate',
    component: SignupActivateEmail,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    },
    beforeEnter: (to, from, next) => {
      return to.params.email || to.params.username ? next() : next({ name: 'auth.signin' })
    }
  },
  {
    name: 'auth.activate.code',
    path: '/auth/activate/:code',
    component: SignupActivate,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    }
  },
  {
    name: 'auth.signup',
    path: '/auth/signup',
    component: Signup,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    }
  },
  {
    name: 'auth.logout',
    path: '/auth/logout',
    beforeEnter: (to, from, next) => {
      store.dispatch('logout', to.params.isStudent)
      if (PORTAL_CONFIGS && PORTAL_CONFIGS.LOGOUT_URL && to.params.isStudent) {
        window.location = PORTAL_CONFIGS.LOGOUT_URL
      } else if (REDIRECT_URL !== undefined && REDIRECT_URL !== '') {
        window.location = REDIRECT_URL
      } else {
        if (KEYCLOAK_ENABLED) return
        return next({ name: 'auth.signin' })
      }
    }
  },
  {
    name: 'auth.recovery',
    path: '/auth/recovery',
    component: PasswordRecovery,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    }
  },
  {
    name: 'auth.recovery.confirm',
    path: '/auth/recovery/confirm',
    component: PasswordRecoveryConfirm,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    },
    beforeEnter: (to, from, next) => {
      return to.params.email ? next() : next({ name: 'auth.recovery' })
    }
  },
  {
    name: 'auth.username.recovery',
    path: '/auth/username/recovery',
    component: UsernameRecovery,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    }
  },
  {
    name: 'auth.username.recovery.confirm',
    path: '/auth/username/recovery/confirm',
    component: UsernameRecoveryConfirm,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    },
    beforeEnter: (to, from, next) => {
      return to.params.email ? next() : next({ name: 'auth.username.recovery' })
    }
  },
  {
    name: 'auth.reset',
    path: '/auth/reset/:token',
    component: PasswordReset,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    }
  },
  {
    name: 'auth.reset.confirm',
    path: '/auth/reset/confirm',
    component: PasswordResetConfirm,
    meta: {
      requiresAuth: false,
      hideNavbar: true
    },
    beforeEnter: (to, from, next) => {
      return to.params.email ? next() : next({ name: 'auth.signin' })
    }
  },
  {
    name: 'auth.change.profile',
    path: '/auth/change-profile/:profileId',
    component: ChangeProfile,
    props: (router) => ({
      profileId: parseInt(router.params.profileId),
      callback: router.params.callback,
      userUuid: router.params.userUuid,
    }),

    meta: {
      requiresAuth: true,
      hideNavbar: true
    }
  }
]
