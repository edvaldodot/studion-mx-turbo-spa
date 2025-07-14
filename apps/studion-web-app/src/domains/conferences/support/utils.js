export const parseConferenceData = (data) => {
  delete data.coHost
  data.alternative_hosts = data.coHosts.map((coHost) => coHost.uuid)
  delete data.coHosts
  data.host = data.host.user.uuid
  return data
}

export const getCreateConferenceEndpoint = (data) => {
  const isManagement = data.sessions_ids.length > 0

  return isManagement
    ? 'conferences/conferences-rooms-multiple-sessions'
    : 'conferences/conferences-rooms'
}
