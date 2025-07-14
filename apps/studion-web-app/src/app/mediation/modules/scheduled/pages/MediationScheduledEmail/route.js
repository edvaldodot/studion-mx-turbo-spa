import PreviewEmailModal from '@/app/mediation/components/MediationModalPreview/PreviewEmailModal/PreviewEmailModal.vue'

export default {
  name: 'mediation.scheduled.email',
  path: 'email',
  component: () => import('./MediationScheduledEmail.vue'),
  meta: {
    context: 'mediation:email',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.email',
      location: { name: 'mediation.scheduled.email' },
    },
  },
  children: [
    {
      name: 'email.preview',
      path: '/email/preview/:id',
      props: true,
      component: PreviewEmailModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
