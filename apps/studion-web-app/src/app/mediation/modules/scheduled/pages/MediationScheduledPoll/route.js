import PreviewPollModal from '@/app/mediation/components/MediationModalPreview/PreviewPollModal/PreviewPollModal.vue'

export default {
  name: 'mediation.scheduled.poll',
  path: 'poll',
  component: () => import('./MediationScheduledPoll.vue'),
  meta: {
    context: 'mediation:poll',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.poll',
      location: { name: 'mediation.scheduled.poll' },
    },
  },
  children: [
    {
      name: 'poll.preview',
      path: '/poll/preview/:id',
      props: true,
      component: PreviewPollModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
