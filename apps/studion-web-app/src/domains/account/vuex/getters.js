export const getEnabledResources = (state) => {
  const FILTER = {
    Trilhas: 'trails',
    Ofertas: 'offerings',
    'Soluções': 'sessions'
  }

  const user = state && state.user
  const orderEducationalResources = user && user.order_educational_resources

  return orderEducationalResources
    ? orderEducationalResources
      .sort((a, b) => a.order - b.order)
      .map((resource) => resource.enabled && FILTER[resource.menu])
    : []
}

export const alreadyHasNickname = (state) => {
  return Boolean(state.user.data.nickname)
}

export const findDeniedContext = (state) => (context) => {
  const deniedContexts = state.user.permissionsDenied || []
  return Boolean(deniedContexts.find((deniedContext) => deniedContext.context.includes(context)))
}