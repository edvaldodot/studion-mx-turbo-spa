export default {
  name: 'management.sessions',
  path: 'sessions',
  redirect: { name: 'management.sessions.modal' },
  component: () => import('./ManagementSessions.vue'),
  meta: {
    requiresAuth: true,
    context: 'classroom:sessions',
    tabLink: {
      text: 'global:form.sessions',
      location: { name: 'management.sessions.modal' },
      disabled: true,
    },
  },
  children: [
    {
      path: 'modal',
      name: 'management.sessions.modal',
      component: () => import('./tabs/SessionsModalPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
}