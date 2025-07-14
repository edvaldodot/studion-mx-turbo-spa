<script>
import { defineComponent } from 'vue'

import Icon from '../Icon'

export default defineComponent({
  name: 'ValidationMessage',

  components: {
    Icon,
  },

  props: {
    validation: {
      type: Object,
      default: null,
    },
    currency: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template v-if="validation" :data-testid="$testId('validation-message')">
  <div
    v-if="validation.$error"
    class="input-message"
  >
    <Icon
      name="error"
      wrapper
      pack="material"
      size="small"
      style="font-size: 15px;"
    />

    <template
      v-if="
        Object.keys(validation).indexOf('differentPassword') !== -1 &&
        validation.required === true &&
        validation.maxLength === true &&
        validation.minLength === true &&
        !validation.differentPassword
      "
    >
      <span class="input-message__feedback">{{ $t('global:validation.different.password') }}</span>
    </template>

    <template
      v-if="
        Object.keys(validation).indexOf('equalPassword') !== -1 &&
        validation.required === true &&
        validation.maxLength === true &&
        validation.minLength === true &&
        !validation.equalPassword
      "
    >
      <span class="input-message__feedback">{{ $t('global:validation.equal.password') }}</span>
    </template>

    <template
      v-if="
        Object.keys(validation).indexOf('validPassword') !== -1 &&
        validation.required === true &&
        validation.maxLength === true &&
        validation.minLength === true &&
        !validation.validPassword
      "
    >
      <span class="input-message__feedback">{{ $t('global:validation.valid.password') }}</span>
    </template>

    <template
      v-if="
        Object.keys(validation).indexOf('minBlanks') !== -1 &&
        validation.required === true &&
        !validation.minBlanks
      "
    >
      <span class="input-message__feedback">{{ $t('global:validation.min.blank') }}</span>
    </template>

    <template
      v-if="
        Object.keys(validation).indexOf('blankSize') !== -1 &&
        validation.required === true &&
        !validation.blankSize
      "
    >
      <span class="input-message__feedback">{{ $t('global:validation.max.blank.size') }}</span>
    </template>

    <template
      v-if="
        Object.keys(validation).indexOf('unfilledBlank') !== -1 &&
        validation.required === true &&
        !validation.unfilledBlank
      "
    >
      <span class="input-message__feedback">{{ $t('global:validation.unfilled.blank') }}</span>
    </template>

    <span
      v-if="!validation.required && validation.required != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.required') }}
    </span>

    <span
      v-if="!validation.questionFilled && validation.questionFilled != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.required.question') }}
    </span>

    <span
      v-if="!validation.minLength && validation.minLength != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.minlength', { num: validation.$params.minLength.min }) }}
    </span>

    <span
      v-if="!validation.maxLength && validation.maxLength != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.maxlength', { num: validation.$params.maxLength.max }) }}
    </span>

    <span
      v-if="!validation.alpha && validation.alpha != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.alpha') }}
    </span>

    <span
      v-if="!validation.alphaNum && validation.alphaNum != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.alphanum') }}
    </span>

    <span
      v-if="!validation.userEmail && validation.userEmail != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.email') }}
    </span>

    <span
      v-if="!validation.userEmailExists && validation.userEmailExists != undefined"
      class="input-message__feedback"
    >
      {{ $t('community.index:feedback.created.error.user.exists') }}
    </span>

    <span
      v-if="!validation.userExistsValidator && validation.userExistsValidator != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.email.exists') }}
    </span>

    <span
      v-if="!validation.usernameValidator && validation.usernameValidator != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.username') }}
    </span>

    <span
      v-if="!validation.nicknameValidator && validation.nicknameValidator != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.nickname') }}
    </span>

    <span
      v-if="!validation.usernameExistsValidator && validation.usernameExistsValidator != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.username.exists') }}
    </span>

    <span
      v-if="!validation.email && validation.email != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.email') }}
    </span>

    <span
      v-if="!validation.minValue && validation.minValue != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.minvalue', { num: validation.$params.minValue.min }) }}
    </span>

    <span
      v-if="!validation.minValueResumed && validation.minValueResumed != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.minvalue.resumed', { num: validation.$params.minValueResumed.min }) }}
    </span>

    <span
      v-if="!validation.valueBiggerZero && validation.valueBiggerZero != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.valuebiggerzero') }}
    </span>

    <span
      v-if="!validation.validTime && validation.validTime != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.time') }}
    </span>

    <span
      v-if="!validation.maxValue && validation.maxValue != undefined"
      class="input-message__feedback"
    >
      {{
        $t('global:validation.maxvalue', {
          num: currency
            ? $n(validation.$params.maxValue.max, 'currency')
            : validation.$params.maxValue.max,
        })
      }}
    </span>

    <span
      v-if="!validation.between && validation.between != undefined"
      class="input-message__feedback"
    >
      {{
        $t('global:validation.between', {
          num1: currency
            ? $n(validation.$params.between.min, 'currency').replace(/^(\D+)/, '$1 ')
            : validation.$params.between.min,
          num2: currency
            ? $n(validation.$params.between.max, 'currency').replace(/^(\D+)/, '$1 ')
            : validation.$params.between.max,
        })
      }}
    </span>

    <span
      v-if="!validation.url && validation.url != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.url') }}
    </span>

    <span
      v-if="
        validation.required &&
        validation.url &&
        !validation.urlYoutubeVimeoValidator &&
        validation.urlYoutubeVimeoValidator != undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.urlYoutubeVimeoValidator') }}
    </span>

    <span
      v-if="!validation.urlVimeo && validation.urlVimeo != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.urlVimeoValidator') }}
    </span>

    <span
      v-if="!validation.fileSize && validation.fileSize != undefined"
      class="input-message__feedback"
    >
      {{
        $t('global:validation.file.size', { num: validation.$params.fileSize.size / 1024 / 1024 })
      }}
    </span>

    <span
      v-if="!validation.required && !validation.mimeType && validation.mimeType != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.mimetype') }}
    </span>

    <span
      v-if="validation.required && !validation.answerAll && validation.answerAll !== undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.matrix:answer.all') }}
    </span>

    <span
      v-if="validation.required && !validation.afterStart && validation.afterStart !== undefined"
      class="input-message__feedback"
    >
      {{ $t('classroom.chat:feedback.create.error.start_should_not_be_greater_than_end') }}
    </span>

    <span
      v-if="validation.required && !validation.mimeType && validation.mimeType != undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.mimetype') }}
    </span>

    <span
      v-if="
        validation.required &&
        (validation.mimeType == undefined || validation.mimeType) &&
        !validation.extension &&
        validation.extension != undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.extension') }}
    </span>

    <span
      v-if="
        validation.required &&
        !validation.isValidCertificateTypeChange &&
        validation.isValidCertificateTypeChange !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('solutions.update:feedback.error:invalid_certificate_type_change') }}
    </span>

    <span
      v-if="
        validation.required && !validation.userNotFound && validation.userNotFound !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.user.not.found') }}
    </span>

    <span
      v-if="
        validation.required && !validation.isEqualToStart && validation.isEqualToStart !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.date') }}
    </span>

    <span
      v-if="
        validation.required && !validation.isFutureDate && validation.isFutureDate !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.future.date') }}
    </span>

    <span
      v-if="
        validation.required &&
        !validation.validateCharacter &&
        validation.validateCharacter !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.validate.character') }}
    </span>

    <span
      v-if="
        validation.required && !validation.sameUsername && validation.sameUsername !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.same.username') }}
    </span>

    <span
      v-if="
        validation.required && !validation.sameMediation && validation.sameMediation !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.same.mediation') }}
    </span>

    <span
      v-if="
        validation.required && !validation.differentTime && validation.differentTime !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.hour') }}
    </span>

    <span
      v-if="validation.required && !validation.moreEndTime && validation.moreEndTime !== undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.hour.end_less_than_start') }}
    </span>

    <span
      v-if="validation.required && !validation.invalidHour && validation.invalidHour !== undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.hour.invalid') }}
    </span>

    <span
      v-if="
        validation.required &&
        !validation.hasPrimaryMember &&
        validation.hasPrimaryMember !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.primary_member') }}
    </span>

    <span
      v-if="
        validation.required &&
        !validation.responsibleDifferentProfile &&
        validation.responsibleDifferentProfile !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.responsible:different.profile') }}
    </span>

    <span
      v-if="
        validation.required &&
        !validation.justOneMemberPrimary &&
        validation.justOneMemberPrimary !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.just.one.member.primary') }}
    </span>

    <span
      v-if="
        validation.required && !validation.fieldNameUsed && validation.fieldNameUsed !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('solutions.metadata:form:field.name:feedback:exists') }}
    </span>

    <span
      v-if="
        validation.required &&
        !validation.invalidBlockPeriod &&
        validation.invalidBlockPeriod !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.invalid.block.period') }}
    </span>

    <span
      v-if="
        validation.required && !validation.maxFilesLength && validation.maxFilesLength !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.files.limit:max', { max: validation.$params.maxFilesLength.max }) }}
    </span>

    <span
      v-if="!validation.maxSizeAllowed && validation.maxSizeAllowed !== undefined"
      class="input-message__feedback"
    >
      {{
        $t('global:validation.files.limit:size.max', {
          fileSize: validation.$params.maxSizeAllowed.sizeLimit / 1024 / 1024,
        })
      }}
    </span>

    <span
      v-if="!validation.sessionPeriod && validation.sessionPeriod !== undefined"
      class="input-message__feedback"
    >
      {{ $t('community.sessions.timeline.dropdown:batch.input.period.warning') }}
    </span>

    <span
      v-else-if="
        !validation.endNeedBeAfterThanInitial && validation.endNeedBeAfterThanInitial !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('community.sessions.timeline.dropdown:batch.input.smaller.than.initial.warning') }}
    </span>

    <span
      v-if="!validation.maxLimit && validation.maxLimit !== undefined"
      class="input-message__feedback"
    >
      {{ $t('global:validation.files.limit:max.limit') }}
    </span>

    <span
      v-if="validation.required && !validation.minGrade && validation.minGrade !== undefined"
      class="input-message__feedback"
    >
      {{ $t('classroom.forum:evaluaton:modal.input.error') }}
    </span>

    <span
      v-if="!validation.slugValidation && validation.slugValidation !== undefined"
      class="input-message__feedback"
    >
      {{ $t('slug.validation.error') }}
    </span>

    <span
      v-if="
        validation.required &&
        !validation.duplicateDescription &&
        validation.duplicateDescription !== undefined
      "
      class="input-message__feedback"
    >
      {{ $t('global:validation.duplicate.input') }}
    </span>
    <span
      v-if="
        validation.required &&
        !validation.validatorTutorCode &&
        validation.validatorTutorCode !== undefined
      "
      class="form-input-message"
    >
      {{ $t('global:validation.chatbot:code') }}
    </span>
  </div>
</template>
<style lang="scss">
@import 'ValidationMessage.scss';
</style>
