export default {
  name: 'management.announcement',
  path: 'announcement',
  redirect: { name: 'management.announcement.index' },
  component: () => import('./ManagementAnnouncement.vue'),
  meta: {
    requiresAuth: true,
    context: 'classroom:announcement',
    tabLink: {
      text: 'solutions:tools.announcement',
      location: { name: 'management.announcement.index' },
    },
  },
  children: [
    {
      path: 'index',
      name: 'management.announcement.index',
      component: () => import('./tabs/TabAnnouncement.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
}