import { getBranchConfigs } from './support/utils/branchConfigs'

export default (() => {
  let branchConfig = getBranchConfigs() || {}
  return {
    ...JSON.parse(Buffer.from(localStorage.getItem('config'), 'base64').toString('ascii')),
    ...branchConfig,
  }
})()
