export const initialCurrentTrail = {
  id: null,
  name: '',
  users: [],
  solutions: [],
  solutionsChanged: false,
  groups: []
}

export const initialState = {
  trails: [],
  current: initialCurrentTrail,
  currentTrailRating: null
}

export default initialState
