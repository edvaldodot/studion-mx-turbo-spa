import PreviewAnnoucementModal from '@/app/mediation/components/MediationModalPreview/PreviewAnnoucementModal/PreviewAnnoucementModal.vue'

export default {
  name: 'mediation.scheduled.annoucemente',
  path: 'annoucemente',
  component: () => import('./MediationScheduledAnnoucement.vue'),
  meta: {
    context: 'mediation:annoucemente',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.announcement',
      location: { name: 'mediation.scheduled.annoucemente' },
    },
  },
  children: [
    {
      name: 'announcement.preview',
      path: '/announcement/preview/:id',
      props: true,
      component: PreviewAnnoucementModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
