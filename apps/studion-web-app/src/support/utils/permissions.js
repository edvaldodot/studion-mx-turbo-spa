export const canRead = (state, context) => {
  if (state.Account.user == null) {
    return false
  }
  if (state.Account.user.currentProfile !== 'agent') {
    return true
  }
  let denied = state.Account.user.permissionsDenied.filter((item) => {
    return item.context === context && item.actionType === 'read'
  })
  return denied.length === 0
}
