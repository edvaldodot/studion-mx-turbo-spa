import PreviewForumModal from '@/app/mediation/components/MediationModalPreview/PreviewForumModal/PreviewForumModal.vue'

export default {
  name: 'mediation.scheduled.discussion',
  path: 'discussion',
  component: () => import('./MediationScheduledDiscussion.vue'),
  meta: {
    context: 'mediation:discussion',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.forum',
      location: { name: 'mediation.scheduled.discussion' },
    },
  },
  children: [
    {
      name: 'topic.preview',
      path: '/discussion/preview/:id',
      props: true,
      component: PreviewForumModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
