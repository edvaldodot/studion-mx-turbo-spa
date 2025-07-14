import PreviewMessageModal from '@/app/mediation/components/MediationModalPreview/PreviewMessageModal/PreviewMessageModal.vue'

export default {
  name: 'mediation.scheduled.message',
  path: 'message',
  component: () => import('./MediationScheduledMessage.vue'),
  meta: {
    context: 'mediation:message',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.message',
      location: { name: 'mediation.scheduled.message' },
    },
  },
  children: [
    {
      name: 'message.preview',
      path: '/message/preview/:id',
      props: true,
      component: PreviewMessageModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
