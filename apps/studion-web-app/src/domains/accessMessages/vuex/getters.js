export const getAccessMessageById = (state) => (id) => {
  return state.list.find(message => message.id === id)
}
