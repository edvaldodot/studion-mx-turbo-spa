import PreviewChatModal from '@/app/mediation/components/MediationModalPreview/PreviewChatModal/PreviewChatModal.vue'

export default {
  name: 'mediation.scheduled.chat',
  path: 'chat',
  component: () => import('./MediationScheduledChat.vue'),
  meta: {
    context: 'mediation:chat',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.chat',
      location: { name: 'mediation.scheduled.chat' },
    },
  },
  children: [
    {
      name: 'chat.preview',
      path: '/chat/preview/:id',
      props: true,
      component: PreviewChatModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
