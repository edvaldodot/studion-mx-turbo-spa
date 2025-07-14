<script>
import { mapActions, mapState } from 'vuex'
import axios from 'axios'
import { defineComponent } from 'vue'
import { required } from 'vuelidate/lib/validators'
import {
  Icon,
  Button,
  InputField,
  SelectField,
  Datepicker,
  CheckboxItem,
  RadioItem,
  TextareaField,
  TextEditor,
  TreeSelect,
  SearchAdd,
  Search,
  UploadFile,
  UploadImage,
  Tabs,
  EmptyMessage,
  Breadcrumbs,
  ModalV2,
  CardV2,
  Pagination,
  FooterV2,
  Datatable,
  VerticalMenu,
  VerticalMenuV2,
  // filters
  FilterList,
  FilterListOrder,
  FilterListSearch,
  FilterListTag,
  FilterPreferences,
  Autocomplete,
  Chip
} from '@/components/general'
// utils
import { makePreferenceColumns } from './util'

const api = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/',
})

export default defineComponent({
  name: 'V2Components',
  components: {
    Icon,
    Button,
    InputField,
    SelectField,
    Datepicker,
    CheckboxItem,
    RadioItem,
    TextareaField,
    TextEditor,
    TreeSelect,
    SearchAdd,
    Search,
    UploadFile,
    UploadImage,
    Tabs,
    EmptyMessage,
    Breadcrumbs,
    ModalV2,
    CardV2,
    Pagination,
    FooterV2,
    Datatable,
    VerticalMenu,
    VerticalMenuV2,
    // filters
    FilterList,
    FilterListOrder,
    FilterListSearch,
    FilterListTag,
    FilterPreferences,
    Autocomplete,
    Chip
  },
  data() {
    return {
      input: [null, 'Texto exemplo'],
      password: [null, 'Texto exemplo', null],
      number: [null, 10],
      select: [null, 1, [1, 2]],
      date: [],
      check: true,
      radio: true,
      text: [null, 'Texto exemplo'],
      textEditor: ['Texto exemplo'],
      tree: [],
      search: [],
      asyncSearch: null,
      asyncSearchLoading: false,
      asyncSearchAdd: null,
      asyncSearchAddLoading: false,
      searchAdd: [],
      searchMenuItems: [
        {
          // icon: 'search',
          label: 'Search',
        },
        {
          // icon: 'search',
          label: 'Stacks',
        },
        {
          // icon: 'search',
          label: 'Got',
        },
      ],
      asyncSearchMenuItems: [],
      asyncSearchAddMenuItems: [],
      options: [
        {
          id: 'a',
          label: 'Item option A',
          children: [
            {
              id: 'aa',
              label: 'Item option AA',
            },
            {
              id: 'ab',
              label: 'Item option AB',
            },
          ],
        },
        {
          id: 'b',
          label: 'Item option B',
        },
        {
          id: 'c',
          label: 'Item option C',
        },
      ],
      selectItems: [
        {
          text: 'Option 01',
          value: 1,
        },
        {
          text: 'Option 02',
          value: 2,
        },
        {
          text: 'Option 03',
          value: 3,
        },
        {
          text: 'Option 04',
          value: 4,
        },
        {
          text: 'Option 05',
          value: 5,
        },
      ],
      autoCompleteItems: [
        {
          text: 'Option 01',
          value: 1,
          select: true,
        },
        {
          text: 'Option 02',
          value: 2,
          select: false,
        },
        {
          text: 'Option 03',
          value: 3,
          select: false,
        },
        {
          text: 'Option 04',
          value: 4,
          select: false,
        },
        {
          text: 'Option 05',
          value: 5,
          select: false,
        },
      ],
      paddingMarginSizes: [0, 1, 2, 4, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96],
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
      files: [],
      filesImage: [],
      linksIcons: [],
      linksText: [],
      linksFull: [],
      linksNotification: [],
      indexActive: 1,
      breadcrumbsList: [
        { key: 1, text: 'Level 01', value: 'value' },
        { key: 2, text: 'Level 02', value: 'value' },
        { key: 3, text: 'Level 03', value: 'value' },
        { key: 4, text: 'Level 04', value: 'value' },
        { key: 5, text: 'Level 05', value: 'value' },
        { key: 6, text: 'Level 06', value: 'value' },
      ],
      showModal: false,
      // Filters
      fielderListTag: [
        {
          title: this.$t('global:status'),
          name: 'status',
          items: [
            {
              active: false,
              id: 'finished',
              text: this.$t(`classroom.assessments.evaluation:competency.finished`),
              property: 'status',
            },
            {
              active: false,
              id: 'finished_with_comment',
              text: this.$t(`classroom.assessments.evaluation:competency.finished_with_comment`),
              property: 'status',
            },
            {
              active: false,
              id: 'open',
              text: this.$t(`classroom.assessments.evaluation:competency.open`),
              property: 'status',
            },
          ],
        },
      ],
      itemDatatable: [
        { key: 1, text: 'Level 01', value: 'value' },
        { key: 2, text: 'Level 02', value: 'value' },
        { key: 3, text: 'Level 03', value: 'value' },
        { key: 4, text: 'Level 04', value: 'value' },
        { key: 5, text: 'Level 05', value: 'value' },
        { key: 6, text: 'Level 06', value: 'value' },
      ],
      menuVersionOne: false,
      menuItems: [
        // MenuAdmin
        {
          items: [
            {
              text: 'global:menu.dashboard',
              icon: 'dashboard',
              link: {
                name: 'dashboard',
              },
            },
          ],
        },
        {
          title: {
            expanded: 'global:menu.group1.title',
            reduced: 'global:menu.group1.title.reduced',
          },
          items: [
            {
              text: 'global:menu.offerings',
              icon: 'auto_stories',
              link: {
                name: 'offerings.list',
              },
            },
            {
              text: 'global:menu.offerings',
              icon: 'auto_stories',
              link: {
                name: 'offerings.list',
              },
            },
            {
              text: 'global:menu.classroom.logout.portal',
              icon: 'local_library',
              link: {
                name: 'offerings.list',
              },
              items: [
                {
                  text: 'classroom:header.tabs.trails',
                  link: {
                    name: 'classroom.trails',
                  },
                },
                {
                  text: 'classroom:header.tabs.offerings',
                  link: {
                    name: 'classroom.offerings',
                  },
                },
                {
                  text: 'classroom:header.tabs.solutions',
                  link: {
                    name: 'classroom.sessions',
                  },
                },
              ],
            },
            {
              text: 'global:menu.faq',
              icon: 'help',
              link: {
                name: 'faq.index',
              },
            },
          ],
        },
        {
          title: {
            expanded: 'global:menu.group2.title',
            reduced: 'global:menu.group2.title.reduced',
          },
          deniedProfile: 'student',
          items: [
            {
              text: 'global:menu.solutions',
              icon: 'book_2',
              link: {
                name: 'solutions.index',
              },
              items: [
                {
                  text: 'solutions:tab.link.solutions',
                  link: { name: 'solutions.list' },
                },
                {
                  text: 'solutions:tab.link.topicsTemplates',
                  link: { name: 'solutions.topicsTemplates' },
                },
                {
                  text: 'solutions:tab.link.metadata',
                  link: { name: 'solutions.metadata' },
                },
                {
                  text: 'solutions:tab.link.questionTemplates',
                  link: { name: 'solutions.questionTemplates' },
                },
              ],
            },
            {
              text: 'global:menu.trails',
              icon: 'route',
              link: {
                name: 'trails.list',
              },
            },
            {
              text: 'global:menu.library',
              icon: 'folder',
              link: {
                name: 'library.index',
              },
              items: [
                {
                  text: 'global:submenu.management',
                  link: { name: 'library.all' },
                },
                {
                  text: 'library:tab.link.2',
                  link: { name: 'library.solutions' },
                },
              ],
            },
            {
              text: 'global:menu.community',
              icon: 'people',
              link: {
                name: 'library.solutions',
              },
              items: [
                {
                  text: 'community:tab.link.5',
                  link: {
                    name: 'community.sessions',
                  },
                },
                {
                  text: 'community:tab.link.1',
                  link: {
                    name: 'community.users',
                  },
                },
                {
                  text: 'community:tab.link.2',
                  link: {
                    name: 'community.profiles',
                  },
                },
                {
                  text: 'community:tab.link.3',
                  link: {
                    name: 'community.groups',
                  },
                },
                {
                  text: 'community:tab.link.4',
                  link: {
                    name: 'community.metadata',
                  },
                },
              ],
            },
            {
              text: 'global:menu.management',
              icon: 'manage_accounts',
              link: {
                name: 'management.index',
              },
            },
            {
              text: 'global:menu.reports',
              icon: 'bar_chart',
              link: {
                name: 'reports.list',
              },
            },
            {
              text: 'global:menu.settings',
              icon: 'settings',
              link: {
                name: 'settings.list',
              },
              items: [
                {
                  text: 'settings:tab.general',
                  link: { name: 'settings.general' },
                },
                {
                  text: 'settings:tab.auth',
                  link: { name: 'settings.auth' },
                },
                {
                  text: 'settings:tab.emails',
                  link: { name: 'settings.notifications' },
                },
                {
                  text: 'settings:tab.certificate',
                  link: { name: 'settings.certificate' },
                },
                {
                  text: 'settings:tab.dashboard',
                  link: { name: 'settings.dashboard' },
                },
                {
                  text: 'settings:tab.categories',
                  link: { name: 'settings.categories' },
                },
                {
                  text: 'settings:tab.branches',
                  link: { name: 'settings.branches' },
                },
                {
                  text: 'settings:tab.instructions',
                  link: { name: 'settings.instructions' },
                },
              ],
            },
            {
              text: 'global:menu.faq',
              icon: 'help',
              link: {
                name: 'faq.index',
              },
              items: [
                {
                  text: 'faq:tab.link.1',
                  link: { name: 'faq.questions' },
                },
                {
                  text: 'faq:tab.link.2',
                  link: { name: 'faq.categories' },
                },
              ],
            },
            {
              text: 'global:menu.portal',
              icon: 'more_horiz',
              link: {
                name: 'portal',
              },
            },
          ],
        },
      ],
    }
  },
  computed: {
    ...mapState(['menuExpanded']),
    expandMenu() {
      return this.menuExpanded
    },
    preferenceColumns() {
      let preferences = [...makePreferenceColumns()]

      if (!this.$isEnabledFeature('branching'))
        preferences = preferences.filter(({ value }) => value !== 'branch')

      if (!this.$isEnabledFeature('slug_identity')) {
        preferences = preferences.filter(({ value }) => value !== 'slug')
      }

      return preferences
    },
    filterListOrderOptions() {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: this.equalsProfile('student') ? 'competency_name' : 'name',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ]
    },
  },
  validations() {
    return {
      text: {
        required,
      },
    }
  },
  mounted() {
    this.setLinks()
    // window.scrollTo(0, document.body.scrollHeight)
    // TODO: foi removido pq fica mostrando alert no login
    // this.setFeedback({
    //   title: 'Título de um alerta toast',
    //   message:
    //     'Lorem ipsum dolor sit amet consectetur. Eu dictum nibh turpis sed velit tortor aliquet. Mi vel aliquam sed elit egestas sit. Turpis eget platea risus pretium lorem a. Sed eros in magna dignissim elementum.',
    //   duration: 10000,
    //   detailText: 'Veja mais',
    //   icon: 'check_circle',
    //   detail: () => {
    //     alert()
    //   },
    // })
  },
  methods: {
    // TODO: foi removido pq fica mostrando alert no login
    // 'setFeedback'
    ...mapActions(['resizeMenu', 'closeMenu']),
    buttonClicked() {
      alert('Click')
    },
    selectedAddSearchItem(item) {
      const { label, nome } = item
      const labelOrName = label ? label : nome

      alert(labelOrName)
    },
    async asyncSearchSimulation() {
      this.asyncSearchLoading = true
      await api
        .get('localidades/mesorregioes')
        .then(({ data }) => {
          this.asyncSearchMenuItems = data
        })
        .finally(() => {
          // delay simulation
          setTimeout(() => {
            this.asyncSearchLoading = false
          }, 2000)
        })
    },
    async asyncSearchAddSimulation() {
      this.asyncSearchAddLoading = true
      await api
        .get('localidades/mesorregioes')
        .then(({ data }) => {
          this.asyncSearchAddMenuItems = data
        })
        .finally(() => {
          // delay simulation
          setTimeout(() => {
            this.asyncSearchAddLoading = false
          }, 2000)
        })
    },
    setLinks() {
      for (let i = 0; i <= 15; i++) {
        this.linksIcons.push({
          text: `Tab component ${i}`,
          icon: 'check_circle',
          noTranslation: true,
        })
        this.linksText.push({
          text: `Tab component ${i}`,
          noTranslation: true,
        })
        this.linksNotification.push({
          text: `Tab component ${i}`,
          notification: 12,
          noTranslation: true,
        })
        this.linksFull.push({
          text: `Tab component ${i}`,
          notification: 12,
          icon: 'check_circle',
          noTranslation: true,
        })
      }
    },
  },
})
</script>
<template>
  <div class="grid grid-nogutter text-base">
    <div class="col-1">
      <VerticalMenu
        v-if="menuVersionOne"
        :items="menuItems"
        @resize="resizeMenu"
        @close="closeMenu"
      />
      <VerticalMenuV2
        v-else
        :items="menuItems"
        @resize="resizeMenu"
        @close="closeMenu"
      />
    </div>
    <!-- Components -->
    <div class="col-10">
      <div class="grid mt-4">
        <div class="col-12">
          <Button @click="menuVersionOne = !menuVersionOne">
            mudar menu para V{{ menuVersionOne ? 2 : 1 }}</Button
          >
        </div>
      </div>
      <div class="v2-components w-10">
        <h1 class="font-light lato-thin">Class Utils</h1>

        <!-- grid -->
        <section>
          <h2>grid</h2>
          <hr />

          <div class="grid">
            <div
              v-for="col in 12"
              :key="col"
              class="col-1"
            >
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
          <div
            v-for="(color, key, index) in colors"
            :key="index"
          >
            <ul class="flex flex-wrap align-items-center">
              <li
                v-for="(hex, shade, index) in color"
                :key="index"
                :class="[`bg-${key}-${shade}`, 'text-center w-1 p-3', { 'text-white': index > 3 }]"
              >
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
            <div
              v-for="margin in paddingMarginSizes"
              :key="margin"
              class="bg-primary m-4"
            >
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
            <div
              v-for="padding in paddingMarginSizes"
              :key="padding"
              class="bg-primary p-4"
            >
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
          <div
            v-for="text in 8"
            :key="text"
            :class="`text-${text + 1}xl`"
          >
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
            <span
              v-for="text in 8"
              :key="text"
              >{{ `.text-${text + 1}xl` }}</span
            >
          </div>
        </section>

        <!-- weight -->
        <section>
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

        <h1 class="font-light lato-thin">Componentes V2</h1>

        <!-- Icons -->
        <section>
          <h2>material icons</h2>
          <hr />

          <div class="flex">
            <Icon
              name="grade"
              pack="material"
            />
            <Icon name="add" />
            <Icon
              name="bolt"
              pack="material"
            />
            <Icon
              name="settings_accessibility"
              pack="material"
            />
            <Icon
              name="error"
              pack="material"
            />
          </div>
          <br />
          <h4>
            <a
              href="https://fonts.google.com/icons?icon.style=Sharp&icon.size=24&icon.color=%235f6368"
              target="_blank"
              rel="noopener noreferrer"
              >material icons</a
            >
          </h4>
        </section>

        <!-- button -->
        <section>
          <h2>button</h2>
          <hr />
          <div class="grid">
            <div class="col-2">
              <Button
                inner-prepend-icon="add"
                @click="buttonClicked"
              >
                Botão
              </Button>
            </div>
            <div class="col-2">
              <Button
                variant="outline"
                @click="buttonClicked"
              >
                Botão
                <template #inner-prepend>
                  <Icon name="add" />
                </template>
              </Button>
            </div>
            <div class="col-2">
              <Button
                variant="text"
                @click="buttonClicked"
              >
                Botão
                <template #inner-prepend>
                  <Icon name="add" />
                </template>
              </Button>
            </div>
            <div class="col-2">
              <Button
                variant="icon"
                icon="add"
                @click="buttonClicked"
              >
                Botão
              </Button>
            </div>
          </div>
          <!-- Secondary -->
          <div class="grid">
            <div class="col-2">
              <Button
                inner-prepend-icon="add"
                severity="secondary"
                @click="buttonClicked"
              >
                Botão
              </Button>
            </div>
            <div class="col-2">
              <Button
                variant="outline"
                severity="secondary"
                @click="buttonClicked"
              >
                Botão
                <template #inner-prepend>
                  <Icon name="add" />
                </template>
              </Button>
            </div>
            <div class="col-2">
              <Button
                variant="text"
                severity="secondary"
                @click="buttonClicked"
              >
                Botão
                <template #inner-prepend>
                  <Icon name="add" />
                </template>
              </Button>
            </div>
            <div class="col-2">
              <Button
                variant="icon"
                severity="secondary"
                icon="add"
                @click="buttonClicked"
              >
                Botão
              </Button>
            </div>
          </div>
          <!-- Disabled -->
          <div class="grid">
            <div class="col-2">
              <Button
                disabled
                @click="buttonClicked"
              >
                Botão
                <template #inner-prepend>
                  <Icon name="add" />
                </template>
              </Button>
            </div>
            <div class="col-2">
              <Button
                disabled
                variant="outline"
                @click="buttonClicked"
              >
                Botão
                <template #inner-prepend>
                  <Icon name="add" />
                </template>
              </Button>
            </div>
            <div class="col-2">
              <Button
                disabled
                variant="text"
                @click="buttonClicked"
              >
                Botão
                <template #inner-prepend>
                  <Icon name="add" />
                </template>
              </Button>
            </div>
            <div class="col-2">
              <Button
                disabled
                variant="icon"
                icon="add"
                @click="buttonClicked"
              >
                Botão
              </Button>
            </div>
          </div>
        </section>

        <!-- input text -->
        <section>
          <h2>input text</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <InputField
                v-model="input[0]"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Texto de exemplo"
                :counter="100"
                required
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="input[0]"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Texto de exemplo"
                :counter="100"
                required
                disabled
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="input[1]"
                placeholder="Texto de exemplo"
                label="Título do campo"
                hint="Texto de apoio aqui"
                :min="0"
                :max="100000"
                required
                :counter="100"
                :validation="$v.text"
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="input[1]"
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
                :counter="100"
              />
            </div>
          </div>
        </section>

        <!-- Password -->
        <section>
          <h2>input password</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <InputField
                v-model="password[0]"
                type="password"
                label="Senha"
                hint="Texto de apoio aqui"
                placeholder="Texto de exemplo"
                required
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="password[0]"
                type="password"
                label="Senha"
                hint="Texto de apoio aqui"
                placeholder="Texto de exemplo"
                required
                disabled
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="password[0]"
                type="password"
                placeholder="Digite sua senha"
                label="Senha"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="password[1]"
                type="password"
                label="Senha"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
              />
            </div>
          </div>
        </section>

        <!-- Number -->
        <section>
          <h2>input number</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <InputField
                v-model="number[0]"
                type="number"
                label="Número"
                hint="Texto de apoio aqui"
                placeholder="Texto de exemplo"
                required
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="number[0]"
                type="number"
                label="Número"
                hint="Texto de apoio aqui"
                placeholder="Texto de exemplo"
                required
                disabled
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="number[0]"
                type="number"
                placeholder="Digite um número"
                label="Número"
                hint="Texto de apoio aqui"
                :min="0"
                :max="100000"
                required
                :validation="$v.text"
              />
            </div>
            <div class="col-3">
              <InputField
                v-model="number[1]"
                type="number"
                label="Número"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
              />
            </div>
          </div>
        </section>

        <!-- Select -->
        <section>
          <h2>select</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <SelectField
                v-model="select[0]"
                :items="selectItems"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Selecione"
                required
                :loading="true"
              />
            </div>
            <div class="col-3">
              <SelectField
                v-model="select[0]"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Selecione"
                required
                disabled
              />
            </div>
            <div class="col-3">
              <SelectField
                v-model="select[0]"
                placeholder="Selecione"
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
              />
            </div>
            <div class="col-3">
              <SelectField
                v-model="select[1]"
                :items="selectItems"
                label="Título do campo"
                placeholder="Selecione"
                hint="Texto de apoio aqui"
                required
              />
            </div>
          </div>
        </section>

        <!-- Select Multiple -->
        <section>
          <h2>select multiple</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <SelectField
                v-model="select[0]"
                :items="selectItems"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Selecione"
                required
                multiple
              />
            </div>
            <div class="col-3">
              <SelectField
                v-model="select[0]"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Selecione"
                required
                disabled
                multiple
              />
            </div>
            <div class="col-3">
              <SelectField
                v-model="select[0]"
                placeholder="Selecione"
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                multiple
              />
            </div>
            <div class="col-3">
              <SelectField
                v-model="select[2]"
                :items="selectItems"
                label="Título do campo"
                placeholder="Selecione"
                hint="Texto de apoio aqui"
                required
                multiple
              />
            </div>
          </div>
        </section>

        <!-- Autocomplete -->
        <section>
          <h2>Autocomplete</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <Autocomplete
                v-model="select[0]"
                :items="autoCompleteItems"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Selecione"
                required
                multiple
                option-property="text"
                loading
              />
            </div>
            <div class="col-3">
              <Autocomplete
                v-model="select[0]"
                :items="autoCompleteItems"
                label="Título do campo"
                hint="Texto de apoio aqui"
                placeholder="Selecione"
                required
                disabled
              />
            </div>
          </div>
        </section>

        <!-- DatePicker -->
        <section>
          <h2>DatePicker</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <Datepicker
                v-model="date[0]"
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                multiple
              />
            </div>
            <div class="col-3">
              <Datepicker
                v-model="date[0]"
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                disabled
                multiple
              />
            </div>
            <div class="col-3">
              <Datepicker
                v-model="date[0]"
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                multiple
              />
            </div>
            <div class="col-3">
              <Datepicker
                v-model="date[0]"
                :items="selectItems"
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                multiple
              />
            </div>
          </div>
        </section>

        <!-- Checkbox -->
        <section>
          <h2>Checkbox</h2>
          <hr />

          <div class="grid">
            <div class="col-2">
              <CheckboxItem
                checked
                description="Título do campo"
                hint="Texto de apoio aqui"
                required
              />
            </div>
            <div class="col-2">
              <CheckboxItem
                checked
                description="Título do campo"
                hint="Texto de apoio aqui"
                required
                disabled
              />
            </div>
            <div class="col-2">
              <CheckboxItem
                checked
                description="Título do campo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
              />
            </div>
            <div class="col-2">
              <CheckboxItem
                checked
                description="Título do campo"
                hint="Texto de apoio aqui"
                required
                indeterminate
              />
            </div>
          </div>
        </section>

        <!-- Radio -->
        <section>
          <h2>Radio</h2>
          <hr />

          <div class="grid">
            <div class="col-2">
              <RadioItem
                v-model="radio"
                checked
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
              />
            </div>
            <div class="col-2">
              <RadioItem
                checked
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                disabled
              />
            </div>
            <div class="col-2">
              <RadioItem
                checked
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
              />
            </div>
            <div class="col-2">
              <RadioItem
                checked
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                indeterminate
              />
            </div>
          </div>
        </section>

        <!-- Switch -->
        <section>
          <h2>Switch</h2>
          <hr />

          <div class="grid">
            <div class="col-2">
              <CheckboxItem
                checked
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                switch-type
              />
            </div>
            <div class="col-2">
              <CheckboxItem
                checked
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                disabled
                switch-type
              />
            </div>
            <div class="col-2">
              <CheckboxItem
                checked
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                switch-type
              />
            </div>
            <div class="col-2">
              <CheckboxItem
                label="Título do campo"
                hint="Texto de apoio aqui"
                disabled
                switch-type
              />
            </div>
          </div>
        </section>

        <!-- Textarea -->
        <section>
          <h2>Textarea</h2>
          <hr />

          <div class="grid">
            <div class="col-6">
              <TextareaField
                v-model="text[0]"
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
                :counter="100"
              />
            </div>
            <div class="col-6">
              <TextareaField
                v-model="text[1]"
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
                :counter="100"
              />
            </div>
            <div class="col-6">
              <TextareaField
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                :counter="100"
              />
            </div>
            <div class="col-6">
              <TextareaField
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                disabled
                :counter="100"
              />
            </div>
          </div>
        </section>

        <!-- TextEditor -->
        <section>
          <h2>TextEditor</h2>
          <hr />

          <div class="grid">
            <div class="col-6">
              <TextEditor
                v-model="textEditor[1]"
                placeholder="Texto de exemplo"
                label="Título do campo"
                hint="Texto de apoio aqui"
                required
                :floating-label="false"
                :rows="5"
                :max-rows="20"
                :counter="100"
              />
            </div>
            <div class="col-6">
              <TextEditor
                v-model="textEditor[1]"
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
                :rows="5"
                :max-rows="20"
                :counter="100"
              />
            </div>
            <div class="col-6">
              <TextEditor
                v-model="textEditor[1]"
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                :rows="5"
                :max-rows="20"
                :counter="100"
              />
            </div>
            <div class="col-6">
              <TextEditor
                v-model="textEditor[1]"
                label="Título do campo"
                placeholder="Texto de exemplo"
                hint="Texto de apoio aqui"
                disabled
                :rows="5"
                :max-rows="20"
                :counter="100"
              />
            </div>
          </div>
        </section>

        <!-- TreeSelect -->
        <section>
          <h2>TreeSelect (ramificação)</h2>
          <hr />

          <!-- {{ tree }} -->
          <div class="grid">
            <div class="col-3">
              <TreeSelect
                v-model="tree[0]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :options="options"
                multiple
              />
            </div>
            <div class="col-3">
              <TreeSelect
                v-model="tree[1]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :options="options"
                multiple
                disabled
              />
            </div>
            <div class="col-3">
              <TreeSelect
                v-model="tree[2]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                :options="options"
                multiple
              />
            </div>
            <div class="col-3">
              <TreeSelect
                v-model="tree[3]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :options="options"
                multiple
              />
            </div>
          </div>
        </section>

        <!-- Search -->
        <section>
          <h2>Search</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <Search
                v-model="search[0]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
              />
            </div>
            <div class="col-3">
              <Search
                v-model="search[1]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
                disabled
              />
            </div>
            <div class="col-3">
              <Search
                v-model="search[2]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
              />
            </div>
            <div class="col-3">
              <Search
                v-model="search[3]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                disabled
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
              />
            </div>
          </div>
        </section>

        <!-- Search Async -->
        <section>
          <h2>Search (Async)</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <Search
                v-model="asyncSearch"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                item-label="nome"
                multiple
                required
                async
                :menu-items="asyncSearchMenuItems"
                :loading="asyncSearchLoading"
                @search="asyncSearchSimulation"
              />
            </div>
          </div>
        </section>

        <!-- Search And Add -->
        <section>
          <h2>Search And Add</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <SearchAdd
                v-model="searchAdd[0]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
                @add="selectedAddSearchItem"
              />
            </div>
            <div class="col-3">
              <SearchAdd
                v-model="searchAdd[1]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
                disabled
              />
            </div>
            <div class="col-3">
              <SearchAdd
                v-model="searchAdd[2]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :validation="$v.text"
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
              />
            </div>
            <div class="col-3">
              <SearchAdd
                v-model="searchAdd[3]"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                disabled
                :options="options"
                :menu-items="searchMenuItems"
                item-label="label"
                multiple
              />
            </div>
          </div>
        </section>

        <!-- Search And Add Async -->
        <section>
          <h2>Search And Add (Async)</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <SearchAdd
                v-model="asyncSearchAdd"
                label="Título do campo"
                placeholder="Selecione um ou mais"
                hint="Texto de apoio aqui"
                required
                :menu-items="asyncSearchAddMenuItems"
                item-label="nome"
                multiple
                search-async
                :search-loading="asyncSearchAddLoading"
                @add="selectedAddSearchItem"
                @search="asyncSearchAddSimulation"
              />
            </div>
          </div>
        </section>

        <!-- UploadFile -->
        <section>
          <h2>UploadFile</h2>
          <hr />

          <div class="grid">
            <div class="col-3 text-base font-bold">Multiple Files</div>
            <div class="col-3 text-base font-bold">Accept .pdf</div>
            <div class="col-3 text-base font-bold">Accept image/*</div>
            <div class="col-3"></div>
            <div class="col-3">
              <UploadFile
                v-model="files[0]"
                label="Carregar arquivo"
                hint="Texto de apoio aqui"
                placeholder="Nenhum arquivo selecionado"
                multiple
                required
              />
            </div>
            <div class="col-3">
              <UploadFile
                v-model="files[1]"
                label="Carregar arquivo"
                hint="Texto de apoio aqui"
                placeholder="Nenhum arquivo selecionado"
                required
                accept=".pdf"
              />
            </div>
            <div class="col-3">
              <UploadFile
                v-model="files[2]"
                label="Carregar arquivo"
                hint="Texto de apoio aqui"
                placeholder="Nenhum arquivo selecionado"
                required
                accept="image/*"
              />
            </div>
            <div class="col-3">
              <UploadFile
                v-model="files[3]"
                label="Carregar arquivo"
                hint="Texto de apoio aqui"
                placeholder="Nenhum arquivo selecionado"
                disabled
                required
              />
            </div>
          </div>
        </section>

        <!-- UploadImage -->
        <section>
          <h2>UploadImage</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <UploadImage
                v-model="filesImage[0]"
                label="Imagem"
                hint="Clique ou arraste para carregar"
                instructions="Adicione uma imagem na proporção 3:2"
                required
              />
            </div>
            <div class="col-3">
              <UploadImage
                v-model="filesImage[1]"
                label="Imagem"
                hint="Clique ou arraste para carregar"
                instructions="Adicione uma imagem na proporção 3:2"
                required
              />
            </div>
            <div class="col-3">
              <UploadImage
                v-model="filesImage[2]"
                label="Imagem"
                hint="Clique ou arraste para carregar"
                instructions="Adicione uma imagem na proporção 3:2"
                required
              />
            </div>
            <div class="col-3">
              <UploadImage
                v-model="filesImage[3]"
                label="Imagem"
                hint="Clique ou arraste para carregar"
                instructions="Adicione uma imagem na proporção 3:2"
                disabled
                required
              />
            </div>
          </div>
        </section>

        <!-- Tabs -->
        <section>
          <h2>Tabs</h2>
          <hr />

          <div class="grid">
            <div class="col-12">
              <Tabs
                :index-active="indexActive"
                :links="linksText"
                show-bottom-border
              />
            </div>
            <div class="col-12">
              <Tabs
                :index-active="indexActive"
                :links="linksIcons"
                show-bottom-border
              />
            </div>
            <div class="col-12">
              <Tabs
                :index-active="indexActive"
                :links="linksNotification"
                show-bottom-border
              />
            </div>
            <div class="col-12">
              <Tabs
                :index-active="indexActive"
                :links="linksFull"
                show-bottom-border
              />
            </div>
          </div>
        </section>

        <!-- EmptyMessage -->
        <section>
          <h2>EmptyMessage</h2>
          <hr />

          <div class="grid">
            <div class="col-6">
              <EmptyMessage show-icon>
                <template #title> Adicione mídias à biblioteca </template>
                <template #text> e enriqueça seus conteúdos. </template>
              </EmptyMessage>
            </div>
            <div class="col-6">
              <EmptyMessage
                title="Adicione mídias à biblioteca"
                text="e enriqueça seus conteúdos."
                show-icon
                no-bg
              />
            </div>
            <div class="col-6">
              <EmptyMessage>
                <template #title> Adicione mídias à biblioteca </template>
                <template #text> e enriqueça seus conteúdos. </template>
              </EmptyMessage>
            </div>
            <div class="col-6">
              <EmptyMessage
                title="Adicione mídias à biblioteca"
                text="e enriqueça seus conteúdos."
                no-bg
              />
            </div>
          </div>
        </section>

        <!-- Breadcrumbs -->
        <section>
          <h2>Breadcrumbs</h2>
          <hr />

          <div class="grid">
            <div class="col-6">
              <Breadcrumbs
                highlight-current
                clickable
                :breadcrumbs-list="breadcrumbsList"
              />
            </div>
            <div class="col-6">
              <Breadcrumbs
                highlight-current
                :breadcrumbs-list="breadcrumbsList"
              />
            </div>
          </div>
        </section>

        <!-- CardV2 -->
        <section>
          <h2>CardV2</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <CardV2
                sub-title="Lorem ipsum dolor sit amet consectetur. Volutpat tellus enim nunc mattis pellentesque id vitae quis."
                image="https://media.gettyimages.com/id/1481389587/pt/foto/relaxing-at-home-with-wireless-technology.jpg?s=612x612&w=0&k=20&c=aqVp5uFoyOd7rZiNuygCa6cYlJV0c4_YEOkiHyFvlX4="
              >
                <template #bar>
                  <div class="flex justify-content-end">
                    <Icon
                      pack="material"
                      name="more_vert"
                      class="cursor-pointer text-white"
                    />
                  </div>
                </template>
                <template #title>
                  <div class="absolute -mt-6">
                    <Chip text="Cat 001" color="success" />
                    <Chip class="ml-1" text="Cat 001" color="success" />
                    <Chip class="ml-1" text="+1" color="success" />
                  </div>
                  Boas práticas para desenvolvedor android. Aqui temos um texto bem grande que deve ficar até duas. Aqui temos um texto bem grande que deve ficar até duas
                </template>
                <template #content>
                  <div class="absolute top-0 -mt-3">
                    <Chip text="Chip" color="success" />
                  </div>
                  Text for body
                </template>
                <template #actions>
                  <a
                    href=""
                    class="text-primary text-base"
                  >
                    Explorar
                  </a>
                </template>
              </CardV2>
            </div>
            <div class="col-3">
              <CardV2
                title="Boas práticas para desenvolvedor android. Aqui temos um texto bem grande que deve ficar até duas. Aqui temos um texto bem grande que deve ficar até duas"
                sub-title="Lorem ipsum dolor sit amet consectetur. Volutpat tellus enim nunc mattis pellentesque id vitae quis."
                content="Text for body"
                image="https://media.gettyimages.com/id/1481389587/pt/foto/relaxing-at-home-with-wireless-technology.jpg?s=612x612&w=0&k=20&c=aqVp5uFoyOd7rZiNuygCa6cYlJV0c4_YEOkiHyFvlX4="
              >
                <template #bar>
                  <div class="flex justify-content-end">
                    <Icon
                      pack="material"
                      name="more_vert"
                      class="cursor-pointer text-white"
                    />
                  </div>
                </template>
                <template #actions>
                  <a
                    href=""
                    class="text-primary text-base"
                  >
                    Explorar
                  </a>
                </template>
              </CardV2>
            </div>
            <div class="col-3">
              <CardV2
                title="Card Title"
                sub-title="Card Sub-Title"
                content="Text for body"
              />
            </div>
            <div class="col-3">
              <CardV2
                title="Boas práticas para desenvolvedor android. Aqui temos um texto bem grande que deve ficar até duas. Aqui temos um texto bem grande que deve ficar até duas"
                sub-title="Lorem ipsum dolor sit amet consectetur. Volutpat tellus enim nunc mattis pellentesque id vitae quis. Lorem ipsum dolor sit amet consectetur. Volutpat tellus enim nunc mattis pellentesque id vitae quis."
                content="Text for body"
              >
                <template #bar>
                  <div class="flex justify-content-end">
                    <Icon
                      pack="material"
                      name="more_vert"
                      class="cursor-pointer"
                    />
                  </div>
                </template>
                <template #actions>
                  <a
                    href=""
                    class="text-primary text-base"
                  >
                    Explorar
                  </a>
                </template>
              </CardV2>
            </div>
            <div class="col-3">
              <CardV2
                title="Boas práticas para desenvolvedor android."
                sub-title="Lorem ipsum dolor sit amet consectetur."
                content="Text for body"
              >
                <template #bar>
                  <div class="flex justify-content-end">
                    <Icon
                      pack="material"
                      name="more_vert"
                      class="cursor-pointer"
                    />
                  </div>
                </template>
                <template #actions>
                  <a
                    href=""
                    class="text-primary text-base"
                  >
                    Explorar
                  </a>
                </template>
              </CardV2>
            </div>
          </div>
        </section>

        <!-- ModalV2 -->
        <section>
          <h2>ModalV2</h2>
          <hr />

          <div class="grid">
            <div class="col-3">
              <Button @click="showModal = !showModal">Open modal</Button>
              <ModalV2 v-model="showModal">
                <div>
                  <h2>Search</h2>
                  <hr />

                  <div
                    v-for="item in 2"
                    :key="item"
                    class="grid"
                  >
                    <div class="col-6">
                      <Search
                        v-model="search[0]"
                        label="Título do campo"
                        placeholder="Selecione um ou mais"
                        hint="Texto de apoio aqui"
                        required
                        :options="options"
                        :menu-items="searchMenuItems"
                        item-label="label"
                        multiple
                      />
                    </div>
                    <div class="col-6">
                      <Search
                        v-model="search[1]"
                        label="Título do campo"
                        placeholder="Selecione um ou mais"
                        hint="Texto de apoio aqui"
                        required
                        :options="options"
                        :menu-items="searchMenuItems"
                        item-label="label"
                        multiple
                        disabled
                      />
                    </div>
                    <div class="col-6">
                      <Search
                        v-model="search[2]"
                        label="Título do campo"
                        placeholder="Selecione um ou mais"
                        hint="Texto de apoio aqui"
                        required
                        :validation="$v.text"
                        :options="options"
                        :menu-items="searchMenuItems"
                        item-label="label"
                        multiple
                      />
                    </div>
                    <div class="col-6">
                      <Search
                        v-model="search[3]"
                        label="Título do campo"
                        placeholder="Selecione um ou mais"
                        hint="Texto de apoio aqui"
                        required
                        disabled
                        :options="options"
                        :menu-items="searchMenuItems"
                        item-label="label"
                        multiple
                      />
                    </div>
                  </div>
                </div>
              </ModalV2>
            </div>
          </div>
        </section>

        <!-- Pagination -->
        <section>
          <h2>Pagination</h2>
          <hr />

          <div class="grid">
            <div class="col-12">
              <Pagination
                :active-page="10"
                :page-count="100"
              />
            </div>
          </div>
        </section>

        <!-- Footer -->
        <section>
          <h2>Footer</h2>
          <hr />

          <div class="grid">
            <div class="col-4">
              <FooterV2 />
            </div>

            <div class="col-4">
              <FooterV2 class="text-black-400" />
            </div>
          </div>
        </section>

        <!-- Toast -->
        <section>
          <h2>Toast</h2>
          <hr />
        </section>

        <!-- Filter -->
        <section>
          <h2>Filter</h2>
          <hr />

          <div class="grid">
            <div class="col-12">
              <FilterList>
                <FilterListSearch
                  slot="search"
                  hide-error-details
                />
                <FilterListTag
                  slot="tag"
                  :options="fielderListTag"
                />
                <FilterListOrder
                  slot="order"
                  :options="filterListOrderOptions"
                  :label="$t('global:filter.order.label')"
                  on-server
                />
                <FilterPreferences
                  slot="preferences"
                  :columns="preferenceColumns"
                  field="users_list"
                />
              </FilterList>
            </div>
          </div>
        </section>

        <!-- Datatable -->
        <section>
          <h2>Datatable</h2>
          <hr />

          <div class="grid">
            <div class="col-12">
              <Datatable :items="itemDatatable">
                <template #thead>
                  <tr>
                    <th
                      v-for="item in 11"
                      :key="item"
                    >
                      Head {{ item }}
                    </th>
                    <th class="w-1 text-center">Actions</th>
                  </tr>
                </template>
                <template #tbody>
                  <!-- pegar { item } do slot -->
                  <tr>
                    <td
                      v-for="body in 11"
                      :key="body"
                    >
                      Body {{ body }}
                    </td>
                    <td class="text-center">
                      <Icon
                        pack="material"
                        name="more_vert"
                        class="cursor-pointer"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td
                      v-for="body in 11"
                      :key="body"
                    >
                      Body {{ body }}
                    </td>
                    <td class="text-center">
                      <Icon
                        pack="material"
                        name="more_vert"
                        class="cursor-pointer"
                      />
                    </td>
                  </tr>
                </template>
              </Datatable>
            </div>
          </div>
        </section>

        <!-- :P -->
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      </div>
    </div>
  </div>
</template>
<style lang="scss">
// @import '@/assets/styles/scss/main.scss';
// @import '@/assets/styles/scss/themes/light.scss';

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
  }
}
</style>
