export const getFeaturedContentById = (state) => (id) => {
  return state.list.find(item => item.id === id)
}
