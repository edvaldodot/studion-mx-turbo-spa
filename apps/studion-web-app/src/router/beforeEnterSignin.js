import store from '@/store'
import jwtDecode from 'jwt-decode'
import config from '@/config'

const { KEYCLOAK_ENABLED } = config

const beforeEnterSignin = async (to, from, next) => {
  const { lastUrl, token, refreshToken, sessionUuid, classroomToolOrTopicType, topicId } = to.params
  const { integrationAppMode, profileId } = to.query
  const isAutoLogin = token && refreshToken

  if (isAutoLogin) {
    // eslint-disable-next-line camelcase
    const { preferred_username } = jwtDecode(token)

    // eslint-disable-next-line camelcase
    const isKeycloak = preferred_username !== undefined
    await store.dispatch('attemptSetToken', {
      token: token,
      refresh_token: refreshToken,
    })

    // force student profile when intregationModeApp is true

    if (integrationAppMode && JSON.parse(integrationAppMode) === true) {
      if (profileId) {
        let classroomType
        if (['class', 'examination', 'research', 'competency'].includes(classroomToolOrTopicType)) {
          classroomType = 'lessons.course.type'
        } else if (classroomToolOrTopicType === 'doubtSolver') {
          classroomType = 'knowledgeBase'
        } else {
          classroomType = classroomToolOrTopicType
        }

        return next({
          name: 'auth.change.profile',
          params: {
            profileId,
            userUuid: sessionUuid,
            callback: function () {
              next({
                name: `classroom.${classroomType}`,
                params: {
                  session_uuid: sessionUuid,
                  type: classroomToolOrTopicType,
                  type_id: topicId,
                },
                replace: true,
              })
            },
          },
        })
      }
    }

    // eslint-disable-next-line camelcase
    if (!isKeycloak) {
      try {
        store.dispatch('setFetching', true)
        await store.dispatch('attemptUserAccountRetrieval')
      } finally {
        store.dispatch('setFetching', false)
      }
    }

    if (sessionUuid) {
      if (topicId) {
        return next({
          name: 'classroom.lessons.course.type',
          params: {
            session_uuid: sessionUuid,
            type: classroomToolOrTopicType,
            type_id: topicId,
          },
          replace: true,
        })
      }

      return next({
        name: 'classroom',
        params: {
          session_uuid: sessionUuid,
          classroomTool: classroomToolOrTopicType || 'panel',
        },
        replace: true,
      })
    }

    if (lastUrl) {
      return next({ path: lastUrl })
    }

    return next({ name: 'dashboard', replace: true, params: { login: true } })
  }

  if (KEYCLOAK_ENABLED) {
    return next({ name: 'dashboard', replace: true })
  }

  next()
}

export default beforeEnterSignin
