import VueRouter from 'vue-router'
import { render } from '@testing-library/vue'
import Action from '../'

export const makeSut = (props = {}, testId = 'action-button') => {
  const router = new VueRouter({
    mode: 'abstract',
    routes: [
      // Your routes here
    ],
  })

  const onClick = jest.fn()

  const propsData = {
    text: '',
    type: '',
    notifyNumber: 0,
    ...props,
  }

  const sut = render(Action, {
    props: {
      ...propsData,
    },
    mocks: {
      $media: {
        mobile: true,
      },
      $testId: () => testId,
    },
    listeners: {
      click: onClick,
    },
    routes: router,
  })

  return {
    sut,
    onClick,
    testId,
    textButton: propsData.text,
  }
}
