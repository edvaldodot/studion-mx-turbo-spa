export const getConferenceById = (state) => (id) => {
  return state.list.find(conf => conf.id === id)
}
