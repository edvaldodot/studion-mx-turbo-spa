export function setupSessionSolutions(allSolutions, sessionConfigs) {
  sessionConfigs.forEach((session) => {
    session.courses = allSolutions.map((solution, index) => {
      const withSchedule = (session.courses || []).find((course) => course.id === solution.id)
      if (withSchedule) withSchedule.position = index + 1
      return (
        {
          ...solution,
          ...withSchedule,
          published: solution.published,
          prerequisite_course_id: solution.prerequisite_course_id,
        } || solution
      )
    })
  })
}
