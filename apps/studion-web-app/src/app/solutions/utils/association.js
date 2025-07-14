export const sortPosition = (itemA, itemB) => {
  if (itemA.position > itemB.position) return 1
  else if (itemA.position < itemB.position) return -1
  else return 0
}
