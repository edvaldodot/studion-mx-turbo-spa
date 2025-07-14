export const currentProfile = (state) => {
  return state.current
}

export const currentProfileDeniedRoutes = (state) => {
  return state.current ? state.current.deniedRoutes : []
}

export const currentProfileIsAdminOrStudent = ({ current }) => {
  const currentProfileName = current && current.name
  return currentProfileName && (currentProfileName === 'Admin' || currentProfileName === 'Student')
}
