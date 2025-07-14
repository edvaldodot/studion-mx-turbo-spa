<script>
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'

export default {
  name: 'MetaList',

  components: {
    Action,
    Checkbox,
    InputField,
    SelectField
  },

  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    value: {
      type: Object,
      default: () => {}
    },

    validation: {
      type: Object,
      required: true
    }
  },

  methods: {
    addOptionsFields (add) {
      if (add) {
        this.value.parameters.options_fields = [
          { name: null, alias: null, visible: true },
          { name: null, alias: null, visible: false }
        ]
      } else {
        this.value.parameters.options_fields = [
          { name: 'name', alias: 'name', visible: true }
        ]
      }

      this.value.parameters.options = [{ fields: {} }, { fields: {} }]
    },

    createFieldAlias (index) {
      this.value.parameters.options_fields[index].alias =
        this.value.parameters.options_fields[index].name
          .toLowerCase()
          .replace(new RegExp(' ', 'g'), '-')
    },

    addOption () {
      this.value.parameters.options.push({ fields: {} })
    },

    removeOption (index) {
      this.value.parameters.options.splice(index, 1)
    }
  }
}
</script>

<template>
  <div v-if="value.parameters.options.length">
    <checkbox
      :items="[
        {
          value: true,
          label: $t('community.metadata:modal.form.insert.hidden.field'),
        },
      ]"
      v-model="value.parameters.allowHidden"
      switch-type
      dark
      @input="addOptionsFields"
      :disabled="disabled"
    />

    <template v-if="value.parameters.allowHidden">
      <input-field
        :label="$t('community.metadata:modal.form.name.visible.field')"
        v-model="value.parameters.options_fields[0].name"
        :validation="validation.parameters.options_fields.$each[0].name"
        dark
        @input="createFieldAlias(0)"
        :disabled="disabled"
      />
      <input-field
        :label="$t('community.metadata:modal.form.name.hidden.field')"
        v-model="value.parameters.options_fields[1].name"
        :validation="validation.parameters.options_fields.$each[1].name"
        dark
        @input="createFieldAlias(1)"
        :disabled="disabled"
      />
    </template>

    <template v-for="(option, index) in value.parameters.options">
      <template v-if="!value.parameters.allowHidden">
        <input-field
          :label="$t('global:form.option', { num: index + 1 })"
          v-model="option.fields[value.parameters.options_fields[0].alias]"
          :validation="validation.parameters.options.$each[index].fields.name"
          dark
          :key="index"
          :disabled="disabled"
        >
          <action
            type="button"
            slot="button"
            icon="close"
            @click="removeOption(index)"
            v-if="value.parameters.options.length > 2"
          />
        </input-field>
      </template>

      <template v-else>
        <div class="modal-form-box" :key="index">
          <h3 class="modal-form-box-title">
            {{ $t("global:form.option", { num: index + 1 }) }}
          </h3>
          <div class="modal-form-box-inner">
            <action
              type="button"
              icon="close"
              class="modal-form-box-close"
              @click="removeOption(index)"
              v-if="
                value.parameters.options.length > 2 && canWrite('metadata')
              "
            />
            <input-field
              :label="
                value.parameters.options_fields[0].name ||
                $t('community.metadata:modal.form.visible.field')
              "
              v-model="
                option.fields[value.parameters.options_fields[0].alias]
              "
              :validation="
                validation.parameters.options.$each[index].fields[
                  value.parameters.options_fields[0].alias
                ]
              "
              :disabled="
                (value.parameters.allowHidden &&
                  value.parameters.options_fields[0].name === null) ||
                disabled
              "
              dark
            />

            <input-field
              :label="
                value.parameters.options_fields[1].name ||
                $t('community.metadata:modal.form.hidden.field')
              "
              v-model="
                option.fields[value.parameters.options_fields[1].alias]
              "
              :validation="
                validation.parameters.options.$each[index].fields[
                  value.parameters.options_fields[1].alias
                ]
              "
              :disabled="
                (value.parameters.allowHidden &&
                  value.parameters.options_fields[1].name === null) ||
                disabled
              "
              dark
            />
          </div>
        </div>
      </template>
    </template>

    <action
      type="button"
      :text="$t('global:form.alternative.add')"
      @click="addOption"
      flat
      dark
      v-if="canWrite('metadata')"
    />
  </div>
</template>
