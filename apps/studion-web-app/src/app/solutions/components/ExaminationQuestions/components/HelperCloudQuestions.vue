<script>
import Checkbox from '@/components/general/Checkbox'
import Radio from '@/components/general/Radio'
import HelperCloud from '@/components/general/HelperCloud'

export default {
  name: 'HelperCloudQuestions',

  components: {
    Checkbox,
    Radio,
    HelperCloud,
  },

  props: {
    type: {
      type: String,
      required: true,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      exampleOptions: [
        {
          value: 1,
          label: this.$t('solutions.create.classes:modal.alternative.item', { item: 'A' }),
        },
        {
          value: 2,
          label: this.$t('solutions.create.classes:modal.alternative.item', { item: 'B' }),
        },
        {
          value: 3,
          label: this.$t('solutions.create.classes:modal.alternative.item', { item: 'C' }),
        },
      ],
      linearOptions: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
      ],
    }
  },
}
</script>
<template>
  <div class="helper-cloud">
    <HelperCloud
      v-if="type === 'multiple_choices_multi_answers'"
      text-dark
    >
      <span>{{ $t('solutions.create.classes:modal.question.multiple.choice.helper') }}</span>
      <Checkbox
        :value="['1', '3']"
        class="helper__radio"
        :items="exampleOptions"
        dark
      />
    </HelperCloud>
    <HelperCloud
      v-if="type === 'multiple_choices'"
      text-dark
    >
      <span>{{ $t('solutions.create.classes:modal.question.objective.helper') }}</span>
      <Radio
        :value="1"
        class="helper__radio"
        :items="exampleOptions"
        dark
      />
    </HelperCloud>
    <HelperCloud
      v-if="type === 'research_linear_scale'"
      text-dark
    >
      <span>{{ $t('solutions.create.classes:modal.question.linear.scale.helper.research') }}</span>
      <div class="helper-cloud__linear-scale">
        <span>{{ $t('global:marker') }}</span>
        <Radio
          :value="1"
          :items="linearOptions"
          :details="false"
          class="helper__radio"
          horizontal
          bottom-values
          dark
        />
        <span>{{ $t('global:marker') }}</span>
      </div>
    </HelperCloud>
    <HelperCloud
      v-if="type === 'research_linear_scale-tip'"
      text-dark
    >
      <span>{{
        $t('solutions.create.classes:modal.question.linear.scale.helper.research.tip')
      }}</span>
      <div class="helper-cloud__linear-scale --tip">
        <span>{{ $t('global:marker') }}</span>
        <Radio
          :value="1"
          :items="[...linearOptions, { value: 0, label: $t('global:do.not.apply') }]"
          :details="false"
          class="helper__radio"
          bottom-values
          horizontal
          dark
        />
        <span>{{ $t('global:marker') }}</span>
      </div>
    </HelperCloud>
    <HelperCloud
      v-if="type === 'research_multiple_choices'"
      text-dark
    >
      <span>{{ $t('solutions.create.classes:modal.question.objective.helper.research') }}</span>
      <Radio
        :value="1"
        class="helper__radio"
        :items="exampleOptions"
        dark
      />
    </HelperCloud>
    <HelperCloud
      v-if="['discursive', 'research_discursive'].includes(type)"
      text-dark
    >
      <span>{{ $t('solutions.create.classes:modal.question.discursive.helper') }}</span>
    </HelperCloud>
    <HelperCloud
      v-if="type === 'true_or_false'"
      text-dark
    >
      <span>{{ $t('solutions.create.classes:modal.question.trueOrFalse.helper') }}</span>
    </HelperCloud>
    <HelperCloud
      v-if="type === 'association'"
      text-dark
    >
      <span v-html="$t('solutions.create.classes:modal.question.association.helper')"></span>
    </HelperCloud>
    <HelperCloud
      v-if="type === 'fill_gap'"
      text-dark
    >
      <span v-html="$t('solutions.create.classes:modal.question.fill.blank.helper')"></span>
    </HelperCloud>
    <HelperCloud
      v-if="type === 'send_file' && validation.files"
      text-dark
    >
      <span
        v-html="
          $t('solutions.create.classes:modal.question.send_file.helper', {
            fileSize: validation.files.$params.maxSizeAllowed.sizeLimit / 1024 / 1024,
            fileLimit: validation.files.$params.maxFilesLength.max,
          })
        "
      ></span>
    </HelperCloud>
    <HelperCloud
      v-if="['matrix', 'research_matrix'].includes(type)"
      text-dark
      class="helper-cloud__matrix"
    >
      <span v-html="$t('solutions.create.classes:modal.question.matrix.helper')"></span>
      <table
        class="mt-2"
        width="100%"
      >
        <tr>
          <td></td>
          <td
            v-for="i in 3"
            :key="i"
            class="text-center"
          >
            {{ $tc('global:column', 1) }}
          </td>
        </tr>
        <tr
          v-for="i1 in 3"
          :key="i1"
        >
          <td>{{ $tc('global:topic', 1) }}</td>
          <td
            v-for="i2 in 3"
            :key="i2"
          >
            <Radio
              :value="i2"
              class="text-center"
              horizontal
              :items="[{ value: 0, label: '' }]"
              dark
            />
          </td>
        </tr>
      </table>
    </HelperCloud>
  </div>
</template>

<style lang="scss">
@import './HelperCloudQuestions.scss';
</style>
