export default {
  name: 'management.forum',
  path: 'forum',
  component: () => import('./ManagementForum.vue'),
  meta: {
    requiresAuth: true,
    context: 'classroom:forum',
    tabLink: {
      text: 'global:menu.forum',
      location: { name: 'management.forum' },
    },
  },
  children: [
    {
      name: 'management.forum.create',
      path: 'create',
      component: () =>
        import('@/app/classroom/modules/forum/pages/ModalAddForum/ModalAddForum.vue'),
      meta: {
        requiresAuth: true,
        // modalCloseLink: { name: 'management.forum' },
      },
    },
  ],
}
