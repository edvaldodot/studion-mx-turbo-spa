import {createLocalVue, mount, RouterLinkStub} from '@vue/test-utils'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import storeConfig from './store-config'
import Draft from '@/app/classroom/components/messages/Draft.vue'

const router = new VueRouter()
const localVue = createLocalVue()

localVue.use(VueRouter)
localVue.use(Vuex)

describe('Draft.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      setFeedback: jest.fn(),
      setFetching: jest.fn(),
      attemptMessagesRetrieval: jest.fn(),
      attemptDeleteMessage: jest.fn()
    }
    store = new Vuex.Store({
      ...storeConfig,
      state: {
        ...storeConfig.state,
        Classroom: {data: {name: 'test'}}
      },
      actions
    })
  })

  it('Should exclude message', () => {
    const wrapper = mount(Draft, {
      stubs: {
        RouterLink: RouterLinkStub
      },
      localVue,
      router,
      store
    })

    expect(wrapper.vm.items.length).toBe(0)
    wrapper.setData({
      items: [{
        'id': 861,
        'interaction_id': 17490,
        'selected': true,
        'author': 'StudiOn Administrator',
        'title': 'gdfxgd',
        'attachment': false,
        'conversationLength': null,
        'starred': false,
        'date': '06/06/2019 20:02',
        'unread': false
      }]
    })
    expect(wrapper.vm.items.length).toBe(1)
  })
})
