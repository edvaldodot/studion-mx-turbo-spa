<script>
import config from '@/config'
import { DEFAULT_MIN_PASSWORD_SIZE } from '@/support/utils/passwordSize'

const { CUSTOM_PASSWORD_REQUIREMENTS } = config

export default {
  name: 'PasswordForceHint',

  components: {
    Icon: () => import('../Icon'),
  },

  props: {
    user: {
      type: Object,
      required: true,
    },
    password: {
      type: String,
      default: '',
    },
    value: {
      type: Boolean,
      required: true,
    },
    validated: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      DEFAULT_MIN_PASSWORD_SIZE: DEFAULT_MIN_PASSWORD_SIZE,
      remainingRules: 0,
    }
  },

  computed: {
    sizeCheck() {
      return this.password && this.password.length >= DEFAULT_MIN_PASSWORD_SIZE
    },
    repeatCheck() {
      if (!this.password) return false
      const reg = /^((?!(.)\2{2}).)*$/
      return reg.test(this.password)
    },
    sequenceCheck() {
      if (!this.password) return false
      const letterReg =
        /^((?!(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)).)*$/
      const numReg = /^((?!(?:012|123|234|345|456|567|678|789)).)*$/
      return letterReg.test(this.password) && numReg.test(this.password)
    },
    userDataCheck() {
      if (!this.password) return false
      let lowerCasePassword = this.password.toLowerCase()
      if (
        this.user.username != null &&
        lowerCasePassword.includes(this.user.username.toLowerCase())
      )
        return false
      if (this.user.name != null && lowerCasePassword.includes(this.user.name.toLowerCase()))
        return false
      if (
        this.user.email != null &&
        lowerCasePassword.includes(this.user.email.split('@')[0].toLowerCase())
      )
        return false
      return true
    },
    numberCheck() {
      if (!this.password) return false
      return /\d/.test(this.password)
    },
    lowerCaseCheck() {
      if (!this.password) return false
      return /[a-z]/.test(this.password)
    },
    upperCaseCheck() {
      if (!this.password) return false
      return /[A-Z]/.test(this.password)
    },
    specialCharacterCheck() {
      if (!this.password) return false
      return /[_\W]/.test(this.password)
    },
    customSizeCheck() {
      if (!this.password) return false
      return this.password.length >= CUSTOM_PASSWORD_REQUIREMENTS.SIZE
    },
    hasCustomPassword() {
      return (
        this.$isEnabledFeature('password_requirements') &&
        CUSTOM_PASSWORD_REQUIREMENTS &&
        CUSTOM_PASSWORD_REQUIREMENTS.ENABLED
      )
    },
    defaultMinPasswordSize() {
      return DEFAULT_MIN_PASSWORD_SIZE
    },
  },

  watch: {
    password: {
      immediate: true,
      handler() {
        let isPasswordValid = false
        if (CUSTOM_PASSWORD_REQUIREMENTS && CUSTOM_PASSWORD_REQUIREMENTS.ENABLED) {
          const valid = this.checkInstanceRules()
          this.$emit('input', valid)
          this.$nextTick(() => {
            this.remainingRules = this.getRamainingRules()
          })
          return
        }
        isPasswordValid =
          this.sizeCheck && this.repeatCheck && this.sequenceCheck && this.userDataCheck
        this.$emit('input', isPasswordValid)
        this.$nextTick(() => {
          this.remainingRules = this.getRamainingRules()
        })
      }
    },
  },

  created() {
    this.setup()
  },
  methods: {
    setup() {
      this.CUSTOM_PASSWORD_REQUIREMENTS = CUSTOM_PASSWORD_REQUIREMENTS
    },
    getInstanceRules() {
      let number = CUSTOM_PASSWORD_REQUIREMENTS.NUMBER ? this.numberCheck : true
      let lowerCase = CUSTOM_PASSWORD_REQUIREMENTS.LOWER_CASE ? this.lowerCaseCheck : true
      let upperCase = CUSTOM_PASSWORD_REQUIREMENTS.UPPER_CASE ? this.upperCaseCheck : true
      let specialChar = CUSTOM_PASSWORD_REQUIREMENTS.SPECIAL_CHAR
        ? this.specialCharacterCheck
        : true
      let customSize = CUSTOM_PASSWORD_REQUIREMENTS.SIZE ? this.customSizeCheck : this.sizeCheck

      return { number, lowerCase, upperCase, specialChar, customSize }
    },
    checkInstanceRules() {
      const { number, lowerCase, upperCase, specialChar, customSize } = this.getInstanceRules()
      return number && lowerCase && upperCase && specialChar && customSize
    },
    getRamainingRules() {
      const numberOfRules = document.querySelectorAll('.hint--default')
      const numberOfActiveRules = document.querySelectorAll('.hint--active')

      if (!numberOfRules || !numberOfActiveRules) return 0

      return numberOfRules.length - numberOfActiveRules.length
    },
    getIcon(rule) {
      if (rule) return 'check-circle'
      return this.validated ? 'error' : null
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('password-force-hint')"
    :class="{ '--validated': validated }"
    class="hint"
  >
    <div class="hint__counter">
      <div
        v-for="i in (hasCustomPassword &&
          CUSTOM_PASSWORD_REQUIREMENTS &&
          CUSTOM_PASSWORD_REQUIREMENTS.SIZE) ||
        DEFAULT_MIN_PASSWORD_SIZE"
        :key="i"
        :class="{ '--active': password && password.length >= i }"
        class="hint__counter-item"
      ></div>
      <p class="text-color">
        {{ ($t(password && password.length) || 0) + ' caracteres' }}
      </p>
    </div>

    <p class="hint__title text-color">{{ $t('Crie uma senha que:') }}</p>

    <div
      v-if="hasCustomPassword && CUSTOM_PASSWORD_REQUIREMENTS.LOWER_CASE"
      :class="{ 'hint--active': lowerCaseCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(lowerCaseCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.custom.1') }}
    </div>
    <div
      v-if="hasCustomPassword && CUSTOM_PASSWORD_REQUIREMENTS.UPPER_CASE"
      :class="{ 'hint--active': upperCaseCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(upperCaseCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.custom.2') }}
    </div>
    <div
      v-if="hasCustomPassword && CUSTOM_PASSWORD_REQUIREMENTS.NUMBER"
      :class="{ 'hint--active': numberCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(numberCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.custom.3') }}
    </div>
    <div
      v-if="hasCustomPassword && CUSTOM_PASSWORD_REQUIREMENTS.SPECIAL_CHAR"
      :class="{ 'hint--active': specialCharacterCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(specialCharacterCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.custom.4') }}
    </div>
    <div
      v-if="hasCustomPassword && CUSTOM_PASSWORD_REQUIREMENTS.SIZE"
      :class="{ 'hint--active': customSizeCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(customSizeCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.custom.5', { text: CUSTOM_PASSWORD_REQUIREMENTS.SIZE }) }}
    </div>
    <div
      v-else
      :class="{ 'hint--active': sizeCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(sizeCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.1', { size: defaultMinPasswordSize }) }}
    </div>
    <div
      :class="{ 'hint--active': userDataCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(userDataCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.3') }}
    </div>
    <div
      :class="{ 'hint--active': repeatCheck && sequenceCheck }"
      class="hint--default text-color"
    >
      <span class="icon__wrapper">
        <Icon
          class="hint__icon"
          :name="getIcon(repeatCheck && sequenceCheck)"
          size="small"
        />
      </span>
      {{ $t('global:password.force.hint.2') }}
    </div>

    <div
      v-if="password"
      class="hint__tip"
    >
      <p
        v-if="remainingRules"
        class="text"
      >
        {{ $tc('global:password.force.tooltip.rules', remainingRules, { remainingRules }) }}
      </p>
      <p
        v-else
        class="text"
      >
        {{ $t('global:password.force.tooltip.success') }}
      </p>
    </div>
  </div>
</template>

<style lang="scss">
@import 'PasswordForceHint.scss';
</style>
