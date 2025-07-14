import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/vue'

import { faker } from '@faker-js/faker'
import { makeSut } from './test'

describe('Action.vue', () => {
  it('should render default button with correctly text', () => {
    const buttonText = faker.lorem.words()
    const { sut } = makeSut({ type: 'button', text: buttonText })
    sut.getByText(buttonText)
  })

  it('should render a link button with correctly text', () => {
    const buttonText = faker.lorem.words()
    const { sut } = makeSut({
      url: faker.internet.url({ protocol: 'http' }),
      type: 'link',
      text: buttonText,
    })
    sut.getByText(buttonText)
  })

  it('should render a icon when not provide type', () => {
    const buttonText = faker.lorem.words()
    const { sut } = makeSut({ text: buttonText, url: faker.internet.url() })
    sut.getByText(buttonText)
  })

  it('should render a button with custom props', () => {
    const { sut, textButton } = makeSut({
      type: 'button',
      text: faker.lorem.words(),
      url: { name: faker.database.column() },
      large: true,
      submit: true,
      flat: true,
      fab: true,
    })

    sut.getByText(textButton)
  })

  it('should emit click event when click on default button', async () => {
    const { sut, onClick, textButton } = makeSut({ type: 'button', text: faker.lorem.words() })
    await fireEvent.click(sut.getByText(textButton))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not emit click event when default button is disabled', async () => {
    const { sut, onClick, textButton } = makeSut({
      text: faker.lorem.words(),
      type: 'button',
      disabled: true,
    })
    await userEvent.click(sut.getByText(textButton))
    expect(onClick).toHaveBeenCalledTimes(0)
  })

  it('should emit link click event when not provide url', async () => {
    const { sut, onClick, textButton } = makeSut({ type: 'link', text: faker.lorem.words() })
    const button = sut.getByText(textButton)
    await fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // TOFIX: link button until call event when disabled
  // it('should not emit click event when not provide url and is disabled', async () => {
  //   const { sut, onClick, textButton } = makeSut({
  //     text: faker.lorem.words(),
  //     type: 'link',
  //     disabled: true,
  //   })
  //   await userEvent.click(sut.getByText(textButton))
  //   expect(onClick).toHaveBeenCalledTimes(0)
  // })

  it('should render a button with correctly notify number', () => {
    const notifyNumber = faker.number.int({ min: 1, max: 99 })
    const { sut } = makeSut({ type: 'button', text: faker.lorem.words(), notifyNumber })
    sut.getByText(notifyNumber)
  })
})
