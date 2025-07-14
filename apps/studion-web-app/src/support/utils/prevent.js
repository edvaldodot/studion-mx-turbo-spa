const preventDefault = (e) => e.preventDefault()

export const $util_addPreventEventList = (node, list) => {
  list.forEach((name) => {
    node.addEventListener(name, preventDefault)
  })
}

export const $util_removePreventEventList = (node, list) => {
  list.forEach((name) => {
    node.removeEventListener(name, preventDefault)
  })
}
