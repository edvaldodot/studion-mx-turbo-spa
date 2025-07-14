const treeSearch = (element, matchingId, returnField = 'name') => {
  if (!element || !element[returnField]) return null
  if (element.id === matchingId) {
    element.breadcrumbs = [element[returnField]]
    return element
  } else if (element.children !== null) {
    var i
    var result = null
    for (i = 0; result === null && element.children && i < element.children.length; i++) {
      result = treeSearch(element.children[i], matchingId, returnField)
    }
    if (result !== null) result.breadcrumbs = [element[returnField], ...result.breadcrumbs]
    return result
  }
  return null
}

export default treeSearch
