export default {
  name: 'management.chat',
  path: 'chat',
  component: () => import('./ManagementChat.vue'),
  meta: {
    requiresAuth: true,
    context: 'classroom:chat',
    tabLink: {
      text: 'global:menu.classroom.chat',
      location: { name: 'management.chat' },
    },
  },
  children: [
    {
      path: 'nickname',
      name: 'management.chat.nickname',
      component: () =>
        import(
          '@/app/classroom/modules/chatrooms/components/ModalNicknameForm/ModalNicknameForm.vue'
        ),
      props: (route) => ({
        suggestion: route.query.suggestion,
      }),
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
