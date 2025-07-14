import { shallowMount, createLocalVue } from '@vue/test-utils'
import Draggable from '@/components/general/Draggable'

const localVue = createLocalVue()
localVue.mixin({
  computed: {
    $media () {
      return {
        mobile: false,
        tablet: false,
        desktop: true
      }
    }
  }
})

describe('Draggable.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Draggable)
  })

  afterEach(() => {
    wrapper = null
  })

  it('should render', () => {
    expect(wrapper.find('.draggable').exists()).toBeTruthy()
  })

  it('should render a table wrapper if enumerated prop is given', () => {
    wrapper.setProps({ enumerated: true })
    expect(wrapper.find('table').exists()).toBeTruthy()
  })

  it('should render a thead if headers slot is given', () => {
    const wrapper = shallowMount(Draggable, {
      propsData: {
        enumerated: true
      },
      slots: {
        headers: '<th class="th>Teste</th>'
      }
    })
    expect(wrapper.find('thead').exists()).toBeTruthy()
  })

  it('should show the correct index for each list item', () => {
    const wrapper = shallowMount(Draggable, {
      propsData: {
        enumerated: true,
        list: ['Teste 1', 'Teste 2']
      },
      localVue
    })

    let $rows = wrapper.findAll('tbody > tr').wrappers

    let column1 = $rows.map(row => {
      return row
        .findAll('td')
        .at(0)
        .text()
    })

    expect(column1[0]).toBe('1')
    expect(column1[1]).toBe('2')
  })
})
