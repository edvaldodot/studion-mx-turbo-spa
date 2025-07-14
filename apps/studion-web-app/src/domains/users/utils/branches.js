export const branchIdsToQueryString = (branchIds) => {
  let branchData = ''
  if (branchIds) {
    branchIds.forEach(branchId => {
      branchData += `branch_ids[]=${branchId}&`
    })
    branchData = branchData.slice(0, -1)
  }
  return branchData
}
