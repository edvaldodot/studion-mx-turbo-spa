<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'V2Components',

  data() {
    return {
      colors: {
        primary: {
          50: '#e3f1f2',
          100: '#cde8eb',
          200: '#b5dee1',
          300: '#9fd5da',
          400: '#87cbd1',
          500: '#6fc1c9',
          600: '#59b9c2',
          700: '#41aeb8',
          800: '#2ba5b1',
          900: '#139ba8',
        },
        secondary: {
          50: '#e3e6e9',
          100: '#cdd3d9',
          200: '#b4bec8',
          300: '#9eabb8',
          400: '#8697a6',
          500: '#6f8395',
          600: '#597085',
          700: '#405b74',
          800: '#2a4864',
          900: '#123352',
        },
        error: {
          50: '#f8eaea',
          100: '#f8dbdb',
          200: '#f5caca',
          300: '#f5bbbb',
          400: '#f2abab',
          500: '#f09b9b',
          600: '#f08c8c',
          700: '#ed7b7b',
          800: '#ed6c6c',
          900: '#ea5b5b',
        },
        success: {
          50: '#eff4ec',
          100: '#e6f0e0',
          200: '#dae9d1',
          300: '#d1e4c5',
          400: '#c5deb6',
          500: '#bad8a8',
          600: '#b1d39c',
          700: '#a5cc8d',
          800: '#9cc881',
          900: '#90c172',
        },
        alert: {
          50: '#f8f3e5',
          100: '#f8edd1',
          200: '#f5e5bb',
          300: '#f5dfa7',
          400: '#f2d891',
          500: '#f0d17b',
          600: '#f0cb67',
          700: '#edc351',
          800: '#edbd3d',
          900: '#eab527',
        },
        blue: {
          50: '#f5f9ff',
          100: '#d0e1fd',
          200: '#abc9fb',
          300: '#85b2f9',
          400: '#609af8',
          500: '#3b82f6',
          600: '#326fd1',
          700: '#295bac',
          800: '#204887',
          900: '#183462',
        },
        green: {
          50: '#f4fcf7',
          100: '#caf1d8',
          200: '#a0e6ba',
          300: '#76db9b',
          400: '#4cd07d',
          500: '#22c55e',
          600: '#1da750',
          700: '#188a42',
          800: '#136c34',
          900: '#0e4f26',
        },
        yellow: {
          50: '#fefbf3',
          100: '#faedc4',
          200: '#f6de95',
          300: '#f2d066',
          400: '#eec137',
          500: '#eab308',
          600: '#c79807',
          700: '#a47d06',
          800: '#816204',
          900: '#5e4803',
        },
        cyan: {
          50: '#f3fbfd',
          100: '#c3edf5',
          200: '#94e0ed',
          300: '#65d2e4',
          400: '#35c4dc',
          500: '#06b6d4',
          600: '#059bb4',
          700: '#047f94',
          800: '#036475',
          900: '#024955',
        },
        pink: {
          50: '#fef6fa',
          100: '#fad3e7',
          200: '#f7b0d3',
          300: '#f38ec0',
          400: '#f06bac',
          500: '#ec4899',
          600: '#c93d82',
          700: '#a5326b',
          800: '#822854',
          900: '#5e1d3d',
        },
        indigo: {
          50: '#f7f7fe',
          100: '#dadafc',
          200: '#bcbdf9',
          300: '#9ea0f6',
          400: '#8183f4',
          500: '#6366f1',
          600: '#5457cd',
          700: '#4547a9',
          800: '#363885',
          900: '#282960',
        },
        teal: {
          50: '#f3fbfb',
          100: '#c7eeea',
          200: '#9ae0d9',
          300: '#6dd3c8',
          400: '#41c5b7',
          500: '#14b8a6',
          600: '#119c8d',
          700: '#0e8174',
          800: '#0b655b',
          900: '#084a42',
        },
        orange: {
          50: '#fff8f3',
          100: '#feddc7',
          200: '#fcc39b',
          300: '#fba86f',
          400: '#fa8e42',
          500: '#f97316',
          600: '#d46213',
          700: '#ae510f',
          800: '#893f0c',
          900: '#642e09',
        },
        bluegray: {
          50: '#f7f8f9',
          100: '#dadee3',
          200: '#bcc3cd',
          300: '#9fa9b7',
          400: '#818ea1',
          500: '#64748b',
          600: '#556376',
          700: '#465161',
          800: '#37404c',
          900: '#282e38',
        },
        purple: {
          50: '#fbf7ff',
          100: '#ead6fd',
          200: '#dab6fc',
          300: '#c996fa',
          400: '#b975f9',
          500: '#a855f7',
          600: '#8f48d2',
          700: '#763cad',
          800: '#5c2f88',
          900: '#432263',
        },
        red: {
          50: '#fff5f5',
          100: '#ffd0ce',
          200: '#ffaca7',
          300: '#ff8780',
          400: '#ff6259',
          500: '#ff3d32',
          600: '#d9342b',
          700: '#b32b23',
          800: '#8c221c',
          900: '#661814',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        black: {
          50: '#f0f3f7',
          100: '#e0e4ea',
          200: '#d3d8de',
          300: '#cdd2da',
          400: '#b8bdc4',
          500: '#898e97',
          600: '#64676d',
          700: '#45484c',
          800: '#2e2f31',
          900: '#000000',
        },
      },
      paddingMarginSizes: [0, 1, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96],
    }
  }
})
</script>
<template>

  <nav class="mb-4 bg-gray-300 p-4">
    <router-link class="text-base text-primary text-gray-800" to="/">Initial |</router-link>&nbsp;
    <router-link class="text-base text-primary text-gray-800" to="/home">Testes de API |</router-link>&nbsp;
    <router-link class="text-base text-primary text-gray-800" to="/theme">Tema</router-link>
  </nav>
  
  <div class="grid grid-nogutter text-base">

    <!-- Components -->
    <div class="col-12">
      <div class="v2-components">
        <section>
          <h1 class="font-light lato-thin">Class Utils</h1>
        </section>
        
        <!-- grid -->
        <section>
          <h2>grid</h2>
          <hr />

          <div class="grid">
            <div v-for="col in 12" :key="col" class="col-1">
              <div class="bg-primary text-base pa-8">.col-1</div>
            </div>
          </div>

          <div class="grid">
            <div class="col-1">
              <div class="bg-primary text-base pa-8">.col-1</div>
            </div>
            <div class="col-11">
              <div class="bg-primary text-base pa-8">.col-11</div>
            </div>
          </div>

          <div class="grid">
            <div class="col-6 col-offset-6">
              <div class="text-base pa-8 bg-primary">.col-6 .col-offset-6</div>
            </div>
          </div>

          <div class="grid">
            <div class="col-6">
              <div class="text-base pa-8 bg-primary">.col-6</div>
            </div>
            <div class="col-6">
              <div class="text-base pa-8 bg-primary">.col-6</div>
            </div>
          </div>

          <div class="grid">
            <div class="col-6">
              <div class="text-base pa-8 bg-primary">.col-6</div>
            </div>
            <div class="col-6">
              <div class="text-base pa-8 bg-primary">.col-6</div>
            </div>
          </div>

          <div class="grid">
            <div class="col-6 sm:col-12 md:col-6 lg:col-3 xl:col-2">
              <div class="text-base pa-8 bg-primary">
                .col-6 .sm:col-12 .md:col-6 .lg:col-3 .xl:col-2
              </div>
            </div>
            <div class="col-6 sm:col-12 md:col-6 lg:col-3 xl:col-2">
              <div class="text-base pa-8 bg-primary">
                .col-6 .sm:col-12 .md:col-6 .lg:col-3 .xl:col-2
              </div>
            </div>
          </div>

          <div class="text-base css-classes">
            breakpoints: <br />
            sm: telefones, md: tablets, lg: notebooks, xl: monitores
          </div>
        </section>

        <!-- palette -->
        <section>
          <h2>palette</h2>
          <hr />
          <div v-for="(color, key, index) in colors" :key="index">
            <ul class="flex flex-wrap align-items-center">
              <li v-for="(hex, shade, index) in color" :key="index"
                :class="[`bg-${key}-${shade}`, 'text-center w-1 p-3', { 'text-white': index > 3 }]">
                <div class="w-12">--{{ key }}-{{ shade }}</div>
                <div class="w-12">
                  {{ hex }}
                </div>
              </li>
            </ul>
          </div>

          <div class="text-base css-classes">
            class:
            <span>.text-{color}-{50-900}</span>
            <span>.bg-{color}-{50-900}</span>
          </div>
        </section>

        <!-- margin -->
        <section>
          <h2>margin</h2>
          <hr />

          <div class="flex">
            <div v-for="margin in paddingMarginSizes" :key="margin" class="bg-primary text-base m-4">
              {{ margin }}
            </div>
          </div>

          <div class="text-base css-classes">
            class:
            <span>.m-0</span>
            <span>.mt-0</span>
            <span>.mr-0</span>
            <span>.mb-0</span>
            <span>.ml-0</span>
            <span>.mx-0</span>
            <span>.mx-auto</span>
            <span>.my-0</span>
          </div>
        </section>

        <!-- padding -->
        <section>
          <h2>padding</h2>
          <hr />

          <div class="flex">
            <div v-for="padding in paddingMarginSizes" :key="padding" class="bg-primary text-base p-4">
              {{ padding }}
            </div>
          </div>

          <div class="text-base css-classes">
            class:
            <span>.p-0</span>
            <span>.pt-0</span>
            <span>.pr-0</span>
            <span>.pb-0</span>
            <span>.pl-0</span>
            <span>.px-0</span>
            <span>.py-0</span>
          </div>
        </section>

        <!-- typography -->
        <section>
          <h2>typography</h2>
          <hr />

          <div class="text-xs">Somos DOT.</div>
          <div class="text-sm">Somos DOT.</div>
          <div class="text-base">Somos DOT.</div>
          <div v-for="text in 8" :key="text" :class="`text-${text + 1}xl`">
            Somos DOT.
          </div>
          <span class="text-2xl sm:text-3xl md:text-5xl lg:text-7xl xl:text-9xl">
            Responsive Text
          </span>

          <div class="text-base css-classes">
            class:
            <span>.text-xs</span>
            <span>.text-sm</span>
            <span>.text-base</span>
            <span v-for="text in 8" :key="text">{{ `.text-${text + 1}xl` }}</span>
          </div>
        </section>

        <!-- weight -->
        <section class="pb-4">
          <h2>weight</h2>
          <hr />

          <div class="text-2xl lato-thin">Somos DOT.</div>
          <div class="text-2xl lato-light">Somos DOT.</div>
          <div class="text-2xl lato-regular">Somos DOT.</div>
          <div class="text-2xl lato-bold">Somos DOT.</div>
          <div class="text-2xl lato-black">Somos DOT.</div>
          <br />
          <h4>Italic</h4>
          <br />
          <div class="text-2xl lato-thin font-italic">Somos DOT.</div>
          <div class="text-2xl lato-light font-italic">Somos DOT.</div>
          <div class="text-2xl lato-regular font-italic">Somos DOT.</div>
          <div class="text-2xl lato-bold font-italic">Somos DOT.</div>
          <div class="text-2xl lato-black font-italic">Somos DOT.</div>

          <div class="text-base css-classes">
            class:
            <span>.font-thin</span>
            <span>.font-light</span>
            <span>.font-regular</span>
            <span>.font-bold</span>
            <span>.font-black</span>

            <span>.font-thin-italic</span>
            <span>.font-light-italic</span>
            <span>.font-regular-italic</span>
            <span>.font-bold-italic</span>
            <span>.font-black-italic</span>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>
<style lang="scss">

.v2-components {
  margin: {
    top: 40px;
    bottom: 40px;
  }

  height: 100vh;

  section {
    margin: 30px 15px 30px 15px;

    hr {
      margin: {
        top: 10px;
        bottom: 10px;
      }
    }

    .css-classes {
      display: flex;
      gap: 8px;
      color: var(--secondary-900);
      margin-top: 100px;
    }

    .bg-primary.text-base {
      color: #fff !important;
    }
  }
}
</style>
