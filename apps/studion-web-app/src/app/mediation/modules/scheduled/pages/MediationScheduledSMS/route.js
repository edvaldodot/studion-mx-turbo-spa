import PreviewSMSModal from '@/app/mediation/components/MediationModalPreview/PreviewSMSModal/PreviewSMSModal.vue'

export default {
  name: 'mediation.scheduled.sms',
  path: 'sms',
  component: () => import('./MediationScheduledSMS.vue'),
  meta: {
    context: 'mediation:sms',
    requiresAuth: true,
    tabLink: {
      text: 'global:form.sms',
      location: { name: 'mediation.scheduled.sms' },
    },
  },
  children: [
    {
      name: 'sms.preview',
      path: '/sms/preview/:id',
      props: true,
      component: PreviewSMSModal,
      meta: {
        requiresAuth: true,
      },
    },
  ],
}
