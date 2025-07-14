<script>
export default {
  name: 'CertificateResult',
  props: {
    name: String,
    styles: String,
    styleName: String,
    date: String,
    hash: String,
    isValid: Boolean,
  },
}
</script>
<template>
  <div
    :data-testid="$testId('certificate-result')"
    class="hash-submited description"
  >
    <div
      v-if="isValid"
      class="text-center my-4"
    >
      <div class="text-2xl text-black-900 my-3">{{ $t('external.certificates.valid') }}</div>
      <div class="text-black-600 text-base">
        {{ $t('external.certificates.valid.description') }}
      </div>
      <div class="text-black-600 font-normal text-base lato-regular mt-4">
        <div class="font-bold">
          {{ $t('external.certificates.student') }}: <span class="font-normal">{{ name }}</span>
        </div>
        <div class="font-bold">
          {{ $t(`global:${styles}`) }}: <span class="font-normal">{{ styleName }}</span>
        </div>
        <div class="font-bold">
          {{ $t('external.certificates.finish.date') }}:
          <span class="font-normal">{{ $d(new Date(date), 'short') }}</span>
        </div>
        <div class="font-bold">
          {{ $t('global:solution.certificate.title') }}: <span class="font-normal">{{ hash }}</span>
        </div>
      </div>
    </div>
    <div v-else>
      <h3>{{ $t('external.certificates.invalid') }}</h3>
      <p class="mt-3 mb-3">{{ hash }}</p>
      <p class="text-color">{{ $t('external.certificates.invalid.description') }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import 'CertificateResult.scss';
</style>
