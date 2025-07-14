export default {
  name: 'management.conference',
  path: 'conference',
  component: () => import('./ManagementConference.vue'),
  meta: {
    requiresAuth: true,
    context: 'classroom:conference',
    tabLink: {
      text: 'solutions:tools.conference',
      location: { name: 'management.conference' },
    },
  },
  children: [
    {
      name: 'management.conference.create',
      path: 'create',
      component: () => import('@/app/classroom/modules/conferences_rooms/pages/ModalAddConference'),
      meta: {
        requiresAuth: true,
        modalCloseLink: { name: 'management.conference' },
        isManagement: true,
      },
    },
    {
      name: 'management.conference.edit',
      path: 'edit',
      component: () => import('@/app/classroom/modules/conferences_rooms/pages/ModalAddConference'),
      props: (router) => ({
        id: parseInt(router.params.id),
        isEditing: true,
      }),
      meta: {
        requiresAuth: true,
        modalCloseLink: { name: 'management.conference' },
        isManagement: true,
      },
    },
  ],
}
