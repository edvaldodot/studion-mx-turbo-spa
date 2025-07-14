<script>
import { mapActions, mapState } from 'vuex'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Datatable from '@/components/general/Datatable'
import Icon from '@/components/general/Icon'
import TooltipSlot from '@/components/general/TooltipSlot'

import { libraryMixin } from '@/mixins/libraryMixin'

export default {
  name: 'DatatableModalAddImport',

  components: {
    Action,
    Checkbox,
    Datatable,
    Icon,
    TooltipSlot,
  },

  mixins: [libraryMixin],

  props: {
    items: {
      type: Array,
      required: true,
    },

    isFolder: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formDataLinks: [],
    }
  },

  computed: {
    ...mapState(['Classroom']),
    contentsListComputed() {
      return this.items.map((item) => {
        item.selected = this.getCheckValue(item.id)
        return item
      })
    },
  },

  watch: {
    formDataLinks(newValue) {
      this.$emit('input', newValue)
    },
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptLibraryFileSessionAssociation']),
    getCheckValue(id) {
      return this.formDataLinks.some((link) => link.id === id)
    },

    addMediaLink(add, id, title) {
      if (add) {
        this.formDataLinks.push({ id: id, title: title })
      } else {
        let idx = this.formDataLinks.map((item) => item.id).indexOf(id)
        if (idx > -1) {
          this.formDataLinks.splice(idx, 1)
        }
      }
    },

    loadLibrary() {
      this.$emit('loadLibrary')
    },

    closeModalImportMedia() {
      this.$emit('closeModalImportMedia')
    },

    openFolder(item) {
      this.$emit('openFolder', item)
    },

    saveLinks() {
      this.$emit('save-links', this.formDataLinks)
    },
  },
}
</script>

<template>
  <form
    class="modal-add-import"
    @submit.prevent="saveLinks"
  >
    <Datatable
      :items="contentsListComputed"
      dark
    >
      <template
        v-if="!$media.mobile"
        slot="thead"
      >
        <tr class="tr-main">
          <th class="th">{{ $t('classroom.library:datatable.header.1') }}</th>
          <th
            class="th"
            width="315"
          >
            {{ $t('classroom.library:datatable.header.2') }}
          </th>
          <th
            class="th"
            width="40"
          ></th>
          <th
            class="th text-center"
            width="75"
          >
            {{ $t('classroom.library:datatable.header.3') }}
          </th>
        </tr>
      </template>
      <template
        slot="tbody"
        slot-scope="props"
      >
        <tr
          v-if="$media.mobile && isFolder"
          class="tr-colspan"
          :class="{
            'open-folder-in-modal-add-import': props.item.isFolder && props.item.countFiles > 0,
          }"
          @click="openFolder(props.item)"
        >
          <td
            class="td"
            colspan="3"
          >
            <Icon
              :name="getFileIconName(props.item)"
              wrapper
            />
            <span class="td-text bolder">{{ props.item.title }}</span>
          </td>
        </tr>
        <tr
          v-if="$media.mobile && !isFolder"
          class="tr-colspan"
        >
          <td
            class="td"
            colspan="3"
          >
            <Icon
              :name="getFileIconName(props.item)"
              wrapper
            />
            <span class="td-text bolder">{{ props.item.title }}</span>
          </td>
        </tr>
        <tr v-if="isFolder">
          <td
            v-if="!$media.mobile"
            class="td"
            :class="{
              'open-folder-in-modal-add-import': props.item.isFolder && props.item.countFiles > 0,
            }"
            @click="openFolder(props.item)"
          >
            <Icon
              :name="getFileIconName(props.item)"
              wrapper
            />
            <span class="td-text bolder">{{ props.item.title }}</span>
          </td>
          <td class="td">
            <span
              v-if="$media.mobile"
              class="td-text-header td-text-header-inline"
              >{{ $t('library:datatable.header.2') }}</span
            >
            <span class="td-text">{{ getFileSize(props.item) }}</span>
          </td>
          <td
            class="td td-actions"
            width="40"
          ></td>
          <td
            class="td text-center"
            width="75"
          >
            <Checkbox
              v-if="props.item.isFolder"
              :value="props.item.selected"
              :items="[{ value: true }]"
              switch-type
              dark
              @input="addMediaLink($event, props.item.id, props.item.title)"
            />
            <div v-else>
              <span class="td-text">-</span>
              <TooltipSlot
                :uppercase="false"
                arrow
                horizontal-align="left"
                shadow
                dark
              >
                <template #activator>
                  <Icon
                    class="modal-add-import-icon-help"
                    name="help"
                    wrapper
                  />
                </template>

                <template #content>
                  <div class="modal-text-tooltip">
                    <p>{{ $t('classroom.library:modal.warning.help.media') }}</p>
                  </div>
                </template>
              </TooltipSlot>
            </div>
          </td>
        </tr>
        <tr v-if="!isFolder">
          <td
            v-if="!$media.mobile"
            class="td"
          >
            <Icon
              :name="getFileIconName(props.item)"
              wrapper
            />
            <span class="td-text bolder">{{ props.item.title }}</span>
          </td>
          <td class="td">
            <span
              v-if="$media.mobile"
              class="td-text-header td-text-header-inline"
              >{{ $t('library:datatable.header.2') }}</span
            >
            <span class="td-text">{{ getFileSize(props.item) }}</span>
          </td>
          <td
            class="td td-actions"
            width="40"
          ></td>
          <td
            class="td text-center"
            width="75"
          >
            <Checkbox
              v-if="!props.item.isFolder"
              :value="props.item.selected"
              :items="[{ value: true }]"
              switch-type
              dark
              @input="($e) => addMediaLink($e, props.item.id, props.item.title)"
            />
            <div v-else>
              <span class="td-text">-</span>
              <TooltipSlot
                :uppercase="false"
                arrow
                horizontal-align="left"
                shadow
                dark
              >
                <template #activator>
                  <Icon
                    class="modal-add-import-icon-help"
                    name="help"
                    wrapper
                  />
                </template>

                <template #content>
                  <div class="modal-text-tooltip">
                    <p>{{ $t('classroom.library:modal.warning.help.folder') }}</p>
                  </div>
                </template>
              </TooltipSlot>
            </div>
          </td>
        </tr>
      </template>
    </Datatable>

    <div class="library-modal-footer mb-6">
      <div class="library-modal-wrapper-footer">
        <div class="library-modal-text-footer">
          <p class="text-color">
            {{ $t('library:modal.footer.text.1') }}
          </p>
          <p class="text-color">
            {{ $t('library:modal.footer.text.2') }}
          </p>
        </div>
        <div class="datatable-item-selected flex gap-1 align-items-center text-base">
          <div>{{ $t('library:modal.link.modal.add.import.datatable.selected') }}</div>
          <div>{{ formDataLinks.length }}</div>
        </div>
      </div>

      <div class="form-submit text-center">
        <Action
          :disabled="formDataLinks.length <= 0"
          :text="$t('classroom.library:modal.import.submit')"
          type="button"
          secondary
          large
          submit
          fixed-width
        />
      </div>
    </div>
  </form>
</template>
<style lang="scss">
.modal-text-tooltip {
  p {
    font-size: 1.2em;
  }
}
.modal-add-import {
  .datatable-wrapper {
    padding: 0 10px 0px;
  }

  .library-modal-footer {
    width: 100%;
    position: absolute;
    bottom: 0;

    .form-submit {
      &.text-center {
        position: absolute;
        left: 50%;
        right: 50%;
        padding-bottom: 20px;
      }
    }

    .library-modal-wrapper-footer {
      display: flex;
      text-align: center;
      justify-content: space-between;
      gap: 20px;

      .library-modal-text-footer {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        font-family: var(--font-family);;
        font-style: italic;
        color: var(--text-color);

        p {
          text-align: left;
          &:first-of-type {
            margin-bottom: 5px;
          }
        }
      }
    }
  }
  @media screen and (max-width: 1024px) {
    .library-modal-wrapper-footer {
      padding-right: 20px;
    }
  }
  @media screen and (max-width: 750px) {
    .library-modal-wrapper-footer {
      align-items: center;
      flex-direction: column;
    }
  }
}
</style>
