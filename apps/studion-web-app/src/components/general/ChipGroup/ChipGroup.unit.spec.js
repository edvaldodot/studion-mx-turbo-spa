import { shallowMount } from '@vue/test-utils'
import ChipGroup from './ChipGroup.vue'
import { Chip } from '@componentes/general'

describe('ChipGroup.vue', () => {
  it('renders the correct number of chips based on the "showChips" prop', () => {
    const chips = ['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4']
    const wrapper = shallowMount(ChipGroup, {
      props: {
        chips,
        showChips: 2,
      },
      global: {
        components: {
          Chip,
        },
      },
    })

    const renderedChips = wrapper.findAllComponents(Chip)
    expect(renderedChips[0].text()).toBe('Chip 1')
    expect(renderedChips[1].text()).toBe('Chip 2')
    expect(renderedChips[2].text()).toContain('+ 2')
  })

  it('renders all chips when "showAll" is true', () => {
    const chips = ['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4']
    const wrapper = shallowMount(ChipGroup, {
      props: {
        chips,
        showAll: true,
      },
      global: {
        components: {
          Chip,
        },
      },
    })

    const renderedChips = wrapper.findAllComponents(Chip)
    expect(renderedChips[0].text()).toBe('Chip 1')
    expect(renderedChips[1].text()).toBe('Chip 2')
    expect(renderedChips[2].text()).toBe('Chip 3')
    expect(renderedChips[3].text()).toBe('Chip 4')
  })

  it('renders the "more" chip when there are hidden chips', () => {
    const chips = ['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4']
    const wrapper = shallowMount(ChipGroup, {
      props: {
        chips,
        showChips: 2,
      },
      global: {
        components: {
          Chip,
        },
      },
    })

    const moreChip = wrapper.findAllComponents(Chip).at(2)
    expect(moreChip.text()).toContain('+ 2')
  })

  it('does not render the "more" chip when "showAll" is true', () => {
    const chips = ['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4']
    const wrapper = shallowMount(ChipGroup, {
      props: {
        chips,
        showAll: true,
      },
      global: {
        components: {
          Chip,
        },
      },
    })

    const moreChip = wrapper.findAllComponents(Chip).filter((chip) => chip.text().includes('+'))
    expect(moreChip.length).toBe(0)
  })

  it('matches the snapshot', () => {
    const chips = ['Chip 1', 'Chip 2', 'Chip 3', 'Chip 4']
    const wrapper = shallowMount(ChipGroup, {
      props: {
        chips,
        showChips: 2,
      },
      global: {
        components: {
          Chip,
        },
      },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
