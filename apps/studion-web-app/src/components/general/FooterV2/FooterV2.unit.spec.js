import { shallowMount } from '@vue/test-utils'
import FooterV2 from './FooterV2.vue'

const defaultConfigMocks = {
  FOOTER_DOUBTS: true,
  CUSTOM_HELP_LINK: '',
  THEME_NAME: 'cl1',
}

const defaultPoliciesMock = {
  PRIVACY_POLICIES: { cl1: 'CL1', cl2: 'CL2' },
  LANGUAGES: {
    'pt-br': 'PORT',
    en: 'ING',
    es: 'ESP',
  },
}

jest.mock('@/support/constants/privacyPolicies', () => defaultPoliciesMock)
jest.mock('@/config', () => defaultConfigMocks)

const mountComponent = (overrides = {}) => {
  return shallowMount(FooterV2, {
    mocks: {
      $t: (msg) => msg,
      equalsProfile: jest.fn(() => true),
      hasAccountInfo: jest.fn(() => true),
      isStudent: jest.fn(() => false),
      $i18n: {
        locale: 'pt-br',
      },
      ...overrides.mocks,
    },
    data() {
      return {
        studentLink: 'https://studentlink.com',
        adminLink: 'https://adminlink.com',
        ...overrides.data,
      }
    },
  })
}

describe('FooterV2.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mountComponent()
  })

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('should display the current year', () => {
    const currentYear = new Date().getFullYear()
    expect(wrapper.find('.footer-v2-copyright').html()).toContain(currentYear.toString())
  })

  describe('FooterDoubts', () => {
    it('should return the admin link if the profile is admin', () => {
      expect(wrapper.vm.helpLink).toBe(wrapper.vm.adminLink)
    })

    it('should return the student link if the profile is student', async () => {
      wrapper = mountComponent({
        mocks: {
          equalsProfile: jest.fn(() => false),
          hasAccountInfo: jest.fn(() => true),
          isStudent: jest.fn(() => true),
        },
      })

      expect(wrapper.vm.helpLink).toBe(wrapper.vm.studentLink)
    })

    it('should use CUSTOM_HELP_LINK if defined', () => {
      const wrapper = mountComponent({
        data: {
          CUSTOM_HELP_LINK: 'https://customlink.com',
        },
      })

      expect(wrapper.vm.helpLink).toBe('https://customlink.com')
    })

    it('should prioritize CUSTOM_HELP_LINK over other links', () => {
      const wrapper = mountComponent({
        data: {
          CUSTOM_HELP_LINK: 'https://custom.com',
        },
        mocks: {
          isStudent: jest.fn(() => true),
          equalsProfile: jest.fn(() => true),
        },
      })
      expect(wrapper.vm.helpLink).toBe('https://custom.com')
    })

    it('should display the doubts section if FOOTER_DOUBTS is true', () => {
      expect(wrapper.html()).toContain('global:terms')
      expect(wrapper.html()).toContain('global:support')
    })

    it('should not display the doubts section if FOOTER_DOUBTS is false', async () => {
      wrapper = mountComponent({ data: { FOOTER_DOUBTS: false } })

      expect(wrapper.html()).not.toContain('global:terms')
      expect(wrapper.html()).not.toContain('global:support')
    })
  })

  describe('Privacy Policies', () => {
    it('should display policies link for listed themes', () => {
      wrapper = mountComponent()
      const policies = wrapper.find('.policies')
      expect(policies.exists()).toBe(true)
    })

    it('should not show policies if theme do not have', () => {
      wrapper = mountComponent({ data: { THEME_NAME: 'cl3' } })
      const policies = wrapper.find('.policies')
      expect(policies.exists()).toBe(false)
    })

    it('should openPolicy open link correctly with current language', () => {
      window.open = jest.fn()

      wrapper = mountComponent()

      wrapper.vm.openPolicy()
      expect(window.open).toHaveBeenCalledWith(
        '/pdf/policies/Política de privacidade - CL1 - PORT.pdf'
      )

      wrapper.vm.$i18n.locale = 'en'
      window.open.mockClear()

      wrapper.vm.openPolicy()
      expect(window.open).toHaveBeenCalledWith(
        '/pdf/policies/Política de privacidade - CL1 - ING.pdf'
      )
    })
  })
})
