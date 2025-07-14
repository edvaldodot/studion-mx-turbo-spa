const ValidateCertificate = () => import('./pages/ValidateCertificate')
const AppZendesk = () => import('./pages/AppZendesk')

export default [
  {
    name: 'validate.certificate',
    path: '/external/validate-certificate',
    component: ValidateCertificate,
    meta: {
      requiresAuth: false,
      hideNavbar: true,
    },
  },
  {
    name: 'app.zendesk',
    path: '/external/app-zendesk',
    component: AppZendesk,
    meta: {
      requiresAuth: true,
      hideNavbar: true,
    },
  },
]
