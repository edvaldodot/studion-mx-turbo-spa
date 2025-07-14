export const getFilterTypeByValue = (state) => (value) => {
  return state.filterTypes.find(filter => filter.value === value)
}
