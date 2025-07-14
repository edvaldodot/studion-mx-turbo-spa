<script>
import Icon from '@/components/general/Icon'
import LinksBar from '@/components/general/LinksBar'

export default {
  name: 'EntranceScreensWrapper',
  components: {
    Icon,
    LinksBar,
  },
}
</script>
<template>
  <div class="bg-black-50 h-full text-black-900">
    <LinksBar
      custom-class="text-primary bg-red-400f absolute top-0 w-full justify-content-center xl:justify-content-end"
      dark
    />
    <div class="grid flex align-items-center h-full xl:w-10 mx-auto hidden mt-6">
      <div class="xl:col-8 xl:flex justify-content-end hidden">
        <div class="flex align-items-center w-11">
          <div
            class="w-4"
            style="height: 700px"
          >
            <div class="flex align-items-end justify-content-center">
              <div class="bg-black-200 w-20rem border-round-xl h-22rem absolute z-0 mr-5"></div>
              <img
                class="z-1 relative"
                src="/assets/images/png/woman-cell-phone.png"
                alt="woman-cell-phone"
              />
            </div>
          </div>
          <div class="flex flex-column gap-4 w-6 text-black-800 p-4">
            <div class="text-3xl lato-light">
              Conhecimento <span class="text-primary lato-regular font-medium">transforma</span>
            </div>
            <div class="text-2xl lato-light">
              Acelere o desenvolvimento profissional da sua equipe.
            </div>
            <div class="flex align-items-center gap-2 text-black-500 text-base lato-light">
              <div>{{ $t('global:know.more') }}</div>
              <Icon
                class="text-primary"
                name="chevron_right"
                pack="material"
              />
              <a
                class="text-base lato-light text-black-500"
                href="https://dotgroup.com.br"
                target="_blank"
                >dotgroup.com.br</a
              >
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 xl:col-4 flex justify-content-center">
        <slot />
      </div>
    </div>
  </div>
</template>
