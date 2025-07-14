import treeSearch from '../support/treeSearch'

export const getBranchById = (state) => (id, returnField = 'name') => {
  for (let branch of state.tree) {
    const result = treeSearch(branch, id, returnField)
    if (result && result.id) return result
  }
}
