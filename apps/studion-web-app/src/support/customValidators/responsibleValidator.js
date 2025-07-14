import { SESSION_TEAM_OPTIONS } from '@/support/utils/constants'

export function hasPrimaryMember (value) {
  return Boolean(value.find(member => member.position === SESSION_TEAM_OPTIONS[0].value))
}

export function responsibleDifferentProfile (value) {
  const primary = value.find(member => member.position === SESSION_TEAM_OPTIONS[0].value)
  const secondary = value.find(member => member.position === SESSION_TEAM_OPTIONS[1].value)
  if (!primary || !secondary) return true

  return primary['profile_name'] !== secondary['profile_name']
}
