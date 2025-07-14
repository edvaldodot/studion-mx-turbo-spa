export default (value) => {
  if (!value) return true
  const regex = /^[A-Z0-9-]{2,100}$/
  return regex.test(value)
}
