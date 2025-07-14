import PreviewEventModal from '@/app/mediation/components/MediationModalPreview/PreviewEventModal/PreviewEventModal.vue'

export default {
  name: 'mediation.scheduled.calendar',
  path: 'calendar',
  component: () => import('./MediationScheduledCalendar.vue'),
  meta: {
    context: 'mediation:calendar',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.calendar',
      location: { name: 'mediation.scheduled.calendar' },
    },
  },
  children: [
    {
      name: 'event.preview',
      path: '/event/preview/:id',
      props: true,
      component: PreviewEventModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
