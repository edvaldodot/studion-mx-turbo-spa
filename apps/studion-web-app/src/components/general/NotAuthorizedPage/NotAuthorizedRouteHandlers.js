const errorMessages = {
  user_not_active_profile: 'auth.signin:feedback.invalid:profile.disabled',
}

export const propsHandlerUnauthorized = (route) => {
  const error = errorMessages[route.params.error]

  return {
    error,
  }
}

export const beforeEnterUnauthorized = (to, _, next) => {
  const error = errorMessages[to.params.error]

  if (!error) {
    next({ name: '404' })
    return
  }

  next()
}
