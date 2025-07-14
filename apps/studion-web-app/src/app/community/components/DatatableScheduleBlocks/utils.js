export const weekDaysSort = (a, b) => {
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return weekDays.indexOf(a.toLowerCase()) - weekDays.indexOf(b.toLowerCase())
}
