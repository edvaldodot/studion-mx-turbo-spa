<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import config from '@/config'
import CallCenterAdapter from '@/support/adapters/CallCenterAdapter'
import ChatbotAdapter from '@/support/adapters/ChatbotAdapter'
import AccessibilityAdapter from '@/support/adapters/AccessibilityAdapter'
import { parseTools } from '@/support/utils/tools'

import gptButtonMixin from '@/components/shared/FloatGptButton/gptButtonMixin'
import { LogoutTimerMixin } from '@/mixins/LogoutTimerMixin'
import { getBranchConfigs } from '@/support/utils/branchConfigs'
import jwtDecode from 'jwt-decode'

import {
  announceKitBoosterBarHandler,
  announceKitUpdateRole,
  loadAnnounceKit,
} from '@/support/utils/announceKit'

const {
  ANNOUNCE_KIT,
  HIDDEN_MENU_ITEMS,
  PORTAL_CONFIGS,
  SEND_PORTAL_REDIRECT_TRAIL_ID,
  VERTICAL_MENU_V2,
  KEYCLOAK_ENABLED,
  FORCE_METADATA_FILL,
  SIGE_CONFIGS,
} = config

export default {
  name: 'AppMain',

  components: {
    AccessMessages: () => import('@/components/general/AccessMessages'),
    Intro: () => import('@/components/general/Intro'),
    ImpersonateHud: () => import('@/components/general/ImpersonateHud'),
    Spinner: () => import('@/components/general/Spinner'),
    SurveyModal: () => import('@/components/general/SurveyModal'),
    Toast: () => import('@/components/general/Toast'),
    ModalOpenSurvey: () => import('@/components/general/ModalOpenSurvey'),
    VerticalMenu: () => import('@/components/general/VerticalMenu'),
    VerticalMenuV2: () => import('@/components/general/VerticalMenuV2'),
    FooterV2: () => import('@/components/general/FooterV2'),
    FloatGptButton: () => import('@/components/shared/FloatGptButton'),
    GptModal: () => import('@/components/shared/GptModal'),
    InactivityModalLogout: () => import('@/app/auth/components/InactivityModalLogout'),
    WorkloadLimitTimer: () => import('@/components/shared/WorkloadLimitTimer'),
  },

  mixins: [gptButtonMixin, LogoutTimerMixin],

  data() {
    return {
      intro: false,
      menuItems: [],
      menuClassroom: [],
      footerOptions: {
        dark: this.accessibility,
        show: true,
      },
      fixedHeader: false,
      blackListThemes: ['embratur'],
      isChatbotEnabled: false,
      isOpenModalOpenSurvey: false,
    }
  },

  computed: {
    ...mapState([
      'Auth',
      'accessibility',
      'fullscreen',
      'accessibilityFontSize',
      'footerHidden',
      'menuOpen',
      'menuExpanded',
      'Classroom',
      'showSurvey',
    ]),
    ...mapGetters([
      'isIntegrationAppMode',
      'getEnabledResources',
      'isTrailClassroom',
      'getIdleTimerAvailability',
    ]),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
    shouldShowNavigation() {
      return (!this.$route.meta.hideNavbar && !this.isIntegrationAppMode) || false
    },
    isConferenceRoomLive() {
      return this.$route.name === 'classroom.conference.live'
    },
    profileId() {
      return this.Account.user.currentProfileId
    },
    isV2Menu() {
      return VERTICAL_MENU_V2
    },
    isUserLoggedIn() {
      return this.Account.user && this.Account.user.currentProfile && this.Auth.token
    },
    getVerticalMenuItems() {
      return this.sessionUuid ? this.menuClassroom : this.menuItems
    },
  },
  watch: {
    $route() {
      if (window.crossOriginIsolated && this.$route.name !== 'classroom.conference.live') {
        navigator.serviceWorker
          .getRegistrations()
          .then((el) => el[0].unregister())
          .then(() => {
            location.reload()
          })
      }
      if (this.getIdleTimerAvailability) {
        this.stopIdleTimer(false)
      }
      if (FORCE_METADATA_FILL) {
        if (this.Account.user.metaStatus === 'new') {
          this.$router.push({ name: 'dashboard.profile.new' })
        } else if (this.Account.user.metaStatus === 'pending') {
          this.$router.push({ name: 'dashboard.profile.pending' })
        }
      }
      this.userTracking()
      this.closeMenu()
    },
    getIdleTimerAvailability(val) {
      if (val) this.stopLogoutTimer()
      this.$nextTick(() => {
        if (!val) this.startLogoutTimer()
      })
    },
    'Auth.token': {
      handler(_, oldValue) {
        if (!oldValue) localStorage.removeItem('evaluation-preferences')
      },
    },
    profileId: {
      handler: 'createMenuItems',
      immediate: true,
    },
    'Account.user': {
      immediate: true,
      handler(user, oldUser) {
        const { isUserLoggedIn } = this
        const isCallCenterFeatureEnabled = this.$isEnabledFeature('call_center')
        const isChatbotFeatureEnabled = this.$isEnabledFeature('chatbot')
        const isAccessibilityFeatureEnabled = this.$isEnabledFeature('accessibility')
        const userData = isUserLoggedIn
          ? { ...user.data, isStudent: this.isStudent(), isDesktop: this.$media.desktop }
          : {}
        const locale = this.$i18n.locale

        let isProfileChange = false
        if (user && oldUser) {
          isProfileChange = user.currentProfile !== oldUser.currentProfile
        }

        if (isProfileChange) {
          this.loadAnnounceKit()
          announceKitBoosterBarHandler(user.currentProfile)
          announceKitUpdateRole(user.currentProfile)
        }

        CallCenterAdapter.create({
          isUserLoggedIn,
          isCallCenterFeatureEnabled,
          userData,
        })

        if (isUserLoggedIn || isProfileChange) {
          ChatbotAdapter.create({
            isUserLoggedIn,
            isChatbotFeatureEnabled,
            userData,
            isProfileChange,
            locale,
            getTokenFn: this.attemptGetChatbotToken,
          })

          if (this.$gtm) {
            this.$gtm.trackEvent({
              event: 'login',
              userId: user.uuid,
            })
          }

          AccessibilityAdapter.create({
            isUserLoggedIn,
            isAccessibilityFeatureEnabled,
            userData,
            isProfileChange,
          })
        }
      },
    },

    'Classroom.floatingNotes.active': {
      handler(value) {
        const zendeskEl = document.querySelector('#launcher')
        if (!zendeskEl) return
        zendeskEl.style.display = value ? 'none' : 'inherit'
      },
    },

    isUserLoggedIn(value) {
      let isImpersonate = false

      if (value) {
        const { isImpersonate: impersonateKey } = jwtDecode(value)
        isImpersonate = !!impersonateKey
      }

      if (
        value &&
        this.$isEnabledFeature('branching') &&
        this.$isEnabledFeature('branch_settings') &&
        !isImpersonate
      ) {
        this.attemptBranchSettings()
          .then(({ data }) => {
            this.defineBranchConfigs(data)
          })
          .catch((err) => {
            if (err.response.message === 'settings_not_found') return
            throw err
          })
      } else {
        this.clearBranchConfig()
      }
    },

    '$i18n.locale': {
      immediate: true,
      handler(locale) {
        if (this.$isEnabledFeature('chatbot')) {
          ChatbotAdapter.setLocale(locale)
        }
      },
    },
    menuOpen: function (newValue) {
      ChatbotAdapter.updateButtonDisplay(newValue)
    },
  },
  created() {
    if (!document.querySelector('.symbol-defs')) {
      const svg = require('@/../public/assets/images/themes/default/svg/symbol-defs.svg')
      let tmp = document.createElement('div')
      tmp.innerHTML = svg
      document.body.appendChild(tmp.childNodes[0])
    }
    if (this.blackListThemes.indexOf(this.$theme) >= 0) {
      this.footerOptions.show = false
    }
    this.showFooter()

    this.loadAnnounceKit()
  },
  mounted() {
    setTimeout(() => {
      this.intro = false
    }, 4000)
    this.$theme !== 'default' && document.body.classList.add(`theme-${this.$theme}`)
  },
  updated() {
    this.isChatbotEnabled = this.getChatbotEnv
  },
  methods: {
    ...mapActions([
      'setFetching',
      'showFooter',
      'resizeMenu',
      'closeMenu',
      'attemptGetChatbotToken',
      'attemptBranchSettings',
      'stopIdleTimer',
      'setAnnounceKitUnreads',
    ]),

    loadAnnounceKit() {
      if (!ANNOUNCE_KIT || !ANNOUNCE_KIT.ENABLED) return

      loadAnnounceKit(
        this.Account.user,
        {
          name: ANNOUNCE_KIT.WNAME,
          id: ANNOUNCE_KIT.WID,
        },
        this.setAnnounceKitUnreads
      )
    },

    async defineBranchConfigs({ spa_theme, spa_name }) {
      if (!spa_theme && !spa_name) return

      let branchConfig = {}

      if (spa_theme) branchConfig.THEME_NAME = spa_theme
      if (spa_name) branchConfig.APP_TITLE = spa_name

      const localBranchConfig = getBranchConfigs()

      const configIsDiff =
        !localBranchConfig ||
        localBranchConfig.THEME_NAME != branchConfig.THEME_NAME ||
        localBranchConfig.APP_TITLE != branchConfig.APP_TITLE

      if (configIsDiff) {
        localStorage.setItem('branchConfig', JSON.stringify(branchConfig))
        location.reload()
      }
    },

    clearBranchConfig() {
      if (getBranchConfigs() != null) {
        localStorage.removeItem('branchConfig')
        location.reload()
      }
    },

    footer(value) {
      this.footerOptions = value
    },
    header(value) {
      this.fixedHeader = value
    },
    userTracking() {
      if (this.isUserLoggedIn && this.$isGA4Enable) {
        this.$gtag.set({
          user_id: this.Account.user.uuid,
          session_uuid: window.app.$route.params.session_uuid,
          user_properties: {
            environment: 'web',
            uuid: this.Account.user.uuid,
            username: this.Account.user.data.username,
            profile: this.Account.user.currentProfile,
            profile_id: this.Account.user.currentProfileId,
            path: this.$route.fullPath,
          },
        })
      }
    },
    createMenuClassRoom() {
      this.menuClassroom = [
        {
          items: [
            {
              text: 'global:menu.classroom.panel',
              icon: 'apps',
              link: {
                name: 'classroom.panel',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.lessons',
              icon: 'import_contacts',
              link: {
                name: 'classroom.lessons.course',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'community.groups:datatable.header.1',
              icon: 'groups',
              disabled: true,
              link: {
                name: this.isStudent() ? 'classroom.pre.project.student' : 'classroom.pre.project',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.library',
              icon: 'collections_bookmark',
              disabled: true,
              link: {
                name: 'classroom.sessionLibrary',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.wiki',
              icon: 'extension',
              disabled: true,
              link: {
                name: 'classroom.wiki',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.forum',
              icon: 'forum',
              disabled: true,
              link: {
                name: 'classroom.forum',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.polls',
              icon: 'thumbs_up_down',
              disabled: true,
              link: {
                name: 'classroom.poll',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.attendance.list',
              icon: 'assignment',
              disabled: true,
              link: {
                name: 'classroom.attendance',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: this.$isEnabledFeature('competency')
                ? 'global:menu.classroom.assessments.ff'
                : 'global:menu.classroom.assessments',
              icon: 'inventory',
              disabled:
                this.isHiddenMenu('classroomAssessments') || !this.canRead('classroom:assessments'),
              notification: this.Classroom.notifications.length > 0,
              link: {
                name: 'classroom.assessments',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.chat',
              icon: 'headset_mic',
              disabled: true,
              link: {
                name: 'classroom.chat',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.conference',
              icon: 'headset_mic',
              disabled: true,
              link: {
                name: 'classroom.conference',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.messages',
              icon: 'email',
              disabled: true,
              link: {
                name: 'classroom.messages',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.help',
              icon: 'help',
              disabled: true,
              link: {
                name: 'classroom.knowledgeBase',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.notes',
              icon: 'notes',
              disabled: true,
              link: {
                name: 'classroom.notes',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text: 'global:menu.classroom.tutorial',
              icon: 'menu_book',
              disabled: !this.equalsProfile('student'),
              link: {
                name: 'classroom.tutorial',
                params: { session_uuid: this.sessionUuid },
              },
            },
            {
              text:
                PORTAL_CONFIGS && PORTAL_CONFIGS.COURSES_URL
                  ? 'global:menu.classroom.logout.portal'
                  : 'global:menu.classroom.logout',
              icon: 'logout',
              highlight: true,
              name: 'exit',
              exact: true,
              link: {
                name: this.getPortalClassroomRouteName(),
                params: this.getPortalClassroomRouteParams(),
              },
            },
          ],
        },
      ]
    },

    /**
     * Check if user can see the community link in the vertical menu
     * @returns {boolean}
     */
    accessCommunity() {
      const tabs = ['sessions', 'users', 'profiles', 'metadata', 'groups']
      for (const tab of tabs) {
        if (this.canRead(tab)) return true
      }
      return false
    },
    /**
     * Choose the route that the user will be sent to when the community button is clicked
     * @returns {string}
     */
    communityLink() {
      if (!this.accessCommunity()) return ''

      const links = {
        users: 'index',
        sessions: 'sessions',
        profiles: 'profiles',
        metadata: 'metadata',
        groups: 'groups',
      }

      for (const tab in links) {
        if (this.canRead(tab)) return `community.${links[tab]}`
      }
    },
    updateMenu(sessionData) {
      const { tools } = sessionData
      this.createMenuClassRoom()
      tools.forEach((toolType) => {
        if (toolType.alias in parseTools) toolType.alias = parseTools[toolType.alias]
        var item = this.menuClassroom[0].items.find(({ link }) => {
          return link.name.includes(toolType.alias)
        })
        if (item && !item.adminTool) {
          item.disabled = false
        }
        if (item && item.adminTool && !this.equalsProfile('student')) {
          item.disabled = false
        }
        if (item && !this.equalsProfile('student')) {
          item.disabled = !this.canRead('classroom:' + toolType.alias)
        }
        if (item && !toolType.hasItem && this.equalsProfile('student')) {
          item.disabled = true
        }
        if (item && item.icon === 'notes') {
          if (!this.Classroom.data.note || this.$isUserImpersonated()) {
            item.disabled = true
            return
          }

          if (this.equalsProfile('student')) {
            item.disabled = false
          }
        }
      })
    },
    isHiddenMenu(menuItem) {
      return (
        typeof HIDDEN_MENU_ITEMS !== 'undefined' &&
        HIDDEN_MENU_ITEMS.split(',').indexOf(menuItem) !== -1
      )
    },
    createMenuItems() {
      this.menuItems = [
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
              disabled:
                this.equalsProfile('student') ||
                !this.canRead('offerings') ||
                this.isHiddenMenu('offeringsManage'),
              link: {
                name: 'offerings.list',
              },
            },
            {
              text: 'global:menu.offerings',
              icon: 'local_library',
              disabled:
                this.notEqualsProfile('student') ||
                this.isHiddenMenu('offeringsShow') ||
                !this.getEnabledResources.includes('offerings'),
              link: {
                name: 'offerings.list',
              },
            },
            {
              text:
                PORTAL_CONFIGS && PORTAL_CONFIGS.COURSES_URL && this.equalsProfile('student')
                  ? 'global:menu.classroom.logout.portal'
                  : 'global:menu.classroom',
              icon: 'local_library',
              link: {
                name: this.getClassroomLinkName(),
              },
              items: [
                {
                  text: 'classroom:header.tabs.trails',
                  link: {
                    name: 'classroom.trails',
                  },
                  disabled:
                    this.equalsProfile('student') && !this.getEnabledResources.includes('trails'),
                },
                {
                  text: 'classroom:header.tabs.offerings',
                  link: {
                    name: 'classroom.offerings',
                  },
                  disabled:
                    this.equalsProfile('student') &&
                    (this.isHiddenMenu('offeringsShow') ||
                      !this.getEnabledResources.includes('offerings')),
                },
                {
                  text: 'classroom:header.tabs.solutions',
                  link: {
                    name: 'classroom.sessions',
                  },
                  disabled:
                    this.equalsProfile('student') && !this.getEnabledResources.includes('sessions'),
                },
              ],
            },
            {
              text: 'global:menu.faq',
              icon: 'help',
              disabled: !this.canRead('faqs') || this.isHiddenMenu('faq'),
              link: {
                name: 'faq.index',
              },
              role: 'student',
            },
            {
              text: 'global:menu.portal',
              icon: 'captive_portal',
              disabled: !(PORTAL_CONFIGS && PORTAL_CONFIGS.MAIN_URL),
              link: {
                name: 'portal',
              },
              role: 'student',
            },
            {
              text: 'global:menu.sige',
              icon: 'open_in_new',
              disabled: !(SIGE_CONFIGS && SIGE_CONFIGS.MAIN_URL),
              link: {
                name: 'sige',
              },
              role: 'student',
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
              disabled: !this.canRead('courses'),
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
                  disabled: !this.$isEnabledFeature('topic_template'),
                },
                {
                  text: 'solutions:tab.link.metadata',
                  link: { name: 'solutions.metadata' },
                  disabled: !this.$isEnabledFeature('course_metas'),
                },
                {
                  text: 'solutions:tab.link.questionTemplates',
                  link: { name: 'solutions.questionTemplates' },
                  disabled: !this.$isEnabledFeature('questions_template'),
                },
              ],
            },
            {
              text: 'global:menu.trails',
              icon: 'route',
              disabled: !this.canRead('paths'),
              link: {
                name: 'trails.list',
              },
            },
            {
              text: 'global:menu.library',
              icon: 'folder',
              disabled: !this.canRead('libraries'),
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
              disabled: !this.accessCommunity(),
              link: {
                name: this.communityLink(),
              },
              items: [
                {
                  text: 'community:tab.link.5',
                  link: {
                    name: 'community.sessions',
                  },
                  disabled: !(this.notEqualsProfile('student') && this.canRead('sessions')),
                },
                {
                  text: 'community:tab.link.1',
                  link: {
                    name: 'community.users',
                  },
                  disabled: !(this.notEqualsProfile('student') && this.canRead('users')),
                },
                {
                  text: 'community:tab.link.2',
                  link: {
                    name: 'community.profiles',
                  },
                  disabled: !(this.notEqualsProfile('student') && this.canRead('profiles')),
                },
                {
                  text: 'community:tab.link.3',
                  link: {
                    name: 'community.groups',
                  },
                  disabled:
                    !(this.notEqualsProfile('student') && this.canRead('groups')) ||
                    this.$isHiddenFeature('groups'),
                },
                {
                  text: 'community:tab.link.4',
                  link: {
                    name: 'community.metadata',
                  },
                  disabled: !(this.notEqualsProfile('student') && this.canRead('metadata')),
                },
              ],
            },
            {
              text: 'global:menu.management',
              icon: 'manage_accounts',
              disabled: this.isStudent() || !this.canRead('my_management'),
              link: {
                name: 'management.index',
              },
            },
            {
              text: 'global:menu.reports',
              icon: 'poll',
              link: {
                name: 'reports.list',
              },
              disabled: !this.canRead('reports'),
            },
            {
              text: 'global:menu.settings',
              icon: 'settings',
              link: {
                name: 'settings.list',
              },
              disabled: !this.canRead('settings'),
              items: [
                {
                  text: 'settings:tab.general',
                  link: { name: 'settings.general' },
                  disabled: !this.canRead('order_educational_resources'),
                },
                {
                  text: 'settings:tab.survey_nps',
                  link: { name: 'settings.survey_nps' },
                },
                {
                  text: 'settings:tab.auth',
                  link: { name: 'settings.auth' },
                  disabled: KEYCLOAK_ENABLED,
                },
                {
                  text: 'settings:tab.emails',
                  link: { name: 'settings.notifications' },
                  disabled: this.$isHiddenFeature('notifications'),
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
                  disabled: !(
                    this.notEqualsProfile('student') &&
                    this.canRead('branches') &&
                    this.$isEnabledFeature('branching')
                  ),
                },
                {
                  text: 'settings:tab.instructions',
                  link: { name: 'settings.instructions' },
                  disabled: !(this.notEqualsProfile('student') && this.$isEnabledFeature('pm_ai')),
                },
              ],
            },
            {
              text: 'global:menu.faq',
              icon: 'help',
              disabled: !this.canRead('faqs'),
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
              icon: 'captive_portal',
              disabled: !(PORTAL_CONFIGS && PORTAL_CONFIGS.MAIN_URL),
              link: {
                name: 'portal',
              },
            },
            {
              text: 'global:menu.sige',
              icon: 'open_in_new',
              disabled: !(SIGE_CONFIGS && SIGE_CONFIGS.MAIN_URL),
              link: {
                name: 'sige',
              },
            },
          ],
        },
      ]
      if (this.$isEnabledFeature('pm')) {
        this.menuItems[2].items.splice(3, 0, {
          text: 'global:menu.mediation',
          icon: 'mail',
          disabled: !this.canRead('mediation_plan'),
          link: {
            name: 'mediation.index',
          },
          items: [
            {
              text: 'global:submenu.management',
              link: { name: 'mediation.list' },
            },
            {
              text: 'mediation.tabs:filters',
              link: { name: 'filter.list' },
            },
            {
              text: 'mediation.templates:title',
              link: { name: 'template.actions.list' },
              disabled: !this.$mediationAiEnabled(),
            },
            {
              text: 'mediation.tabs:scheduled.actions',
              link: { name: 'scheduled.index' },
              disabled: !this.canRead('mediation_plan:program_actions'),
            },
          ],
        })
      }
    },
    getClassroomLinkName() {
      const mainResource = this.getEnabledResources.find(Boolean) || 'index'
      if (!(PORTAL_CONFIGS && PORTAL_CONFIGS.COURSES_URL && this.equalsProfile('student')))
        return `classroom.${mainResource}`

      return 'portal.courses'
    },
    isPortalLink(url) {
      return PORTAL_CONFIGS && PORTAL_CONFIGS[url] && this.equalsProfile('student')
    },
    getPortalClassroomRouteName() {
      if (this.isTrailClassroom && this.isPortalLink('TRAIL_COURSES_URL'))
        return 'portal.courses.trail'
      else if (this.isTrailClassroom) return 'classroom.trail.sessions'

      if (this.isPortalLink('COURSES_URL')) return 'portal.courses'

      if (this.$route.params.offering_id) return 'classroom.offerings.solutions'

      return 'classroom.index'
    },
    getPortalClassroomRouteParams() {
      const requiresTrailId =
        this.isTrailClassroom &&
        this.isPortalLink('TRAIL_COURSES_URL') &&
        SEND_PORTAL_REDIRECT_TRAIL_ID

      if (requiresTrailId) return { trailId: this.Classroom.data.path.id }
      else if (this.isTrailClassroom) return { id: this.Classroom.data.path.id }

      if (this.$route.params.offering_id) return { id: this.$route.params.offering_id }

      return {}
    },
  },
}
</script>

<template>
  <transition
    v-if="intro"
    name="intro"
    appear
    :duration="{ enter: 4000, leave: 1000 }"
  >
    <Intro />
  </transition>

  <div
    v-else
    id="app"
    class="bg-black-50"
    :class="{
      'menu-is-expanded': menuExpanded && Auth.token && !$media.mobile && shouldShowNavigation,
      'menu-is-open': menuOpen && $media.mobile,
      'is-fullscreen': fullscreen,
      'has-menu':
        shouldShowNavigation &&
        Auth.token &&
        !$media.mobile &&
        Account.user &&
        Account.user.currentProfile,
      'font-size-1': accessibilityFontSize === 1,
      'font-size-2': accessibilityFontSize === 2,
      'has-accessibility-active': accessibility,
    }"
  >
    <Spinner />

    <div class="grid h-full grid-nogutter p-0 m-0">
      <div
        v-if="isUserLoggedIn && shouldShowNavigation"
        class="col-fixed p-0 m-0"
        :class="{ hidden: !menuOpen && $media.mobile }"
        :style="{ width: menuExpanded ? '281px' : '70px' }"
      >
        <VerticalMenuV2
          v-if="isV2Menu && !sessionUuid"
          :items="getVerticalMenuItems"
          :classroom="!!sessionUuid"
          @resize="resizeMenu"
          @close="closeMenu"
        />

        <VerticalMenu
          v-else
          :items="getVerticalMenuItems"
          :classroom="!!sessionUuid"
          @resize="resizeMenu"
          @close="closeMenu"
        >
          <template #bottom>
            <WorkloadLimitTimer
              v-if="!!sessionUuid && !$media.mobile && $route.name !== 'classroom.panel.dashboard'"
            />
          </template>
        </VerticalMenu>
      </div>
      <div class="col w-6 min-h-screen p-0 m-0">
        <main
          class="bg-black-50"
          :class="{ 'has-fixed-header': fixedHeader }"
        >
          <router-view
            @change-theme-footer="footer"
            @fixed-header="header"
            @updateMenu="updateMenu"
          />
        </main>
        <div
          v-if="!footerHidden && !isIntegrationAppMode"
          class="flex justify-content-center mt-5 xl:mt-0 w-full h-5rem my-4"
        >
          <FooterV2 v-bind="footerOptions" />
        </div>
      </div>
    </div>
    <Toast />

    <template v-if="!isConferenceRoomLive">
      <ModalOpenSurvey v-model="isOpenModalOpenSurvey" />

      <AccessMessages :key="Account.user.uuid + '_' + Account.user.currentProfileId" />

      <SurveyModal />
    </template>

    <ImpersonateHud v-if="$isEnabledFeature('impersonate_read_only') && $isUserImpersonated()" />

    <template v-if="!isOpenModalOpenSurvey && !showSurvey && isChatbotEnabled">
      <GptModal v-if="isUserLoggedIn" />

      <FloatGptButton v-if="!(getChatVendor && getAITutorCode === null)" />
    </template>

    <InactivityModalLogout
      v-if="showModalInactivity"
      @close="showModalInactivity = false"
    />
  </div>
</template>

<style lang="scss">
@import '~@/assets/styles/themes/default/global.scss';
</style>
