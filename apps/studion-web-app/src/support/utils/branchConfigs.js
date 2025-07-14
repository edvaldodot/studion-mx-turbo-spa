export const getBranchConfigs = () => {
  const localBranchConfig = localStorage.getItem('branchConfig')
  return localBranchConfig ? JSON.parse(localBranchConfig) : null
}
