export const isTrailClassroom = (state) => {
  return state.data && state.data.path && state.data.path.id
}

export const classroomBranchIds = (state) => {
  const hasCourse = state.data && state.data.course
  const hasBranches = hasCourse && state.data.course.branches
  if (!hasBranches) {
    return null
  }

  return state.data.course.branches.map(branch => branch.id)
}

export const isClassroomFinalStatus = (state) => {
  return state.classroomSetStatusFinal
}

export const getClassroomNotifications = (state) => {
  return state.notifications
}
