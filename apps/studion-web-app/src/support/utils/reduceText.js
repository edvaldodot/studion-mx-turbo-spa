export default function reduceText (el, child) {
  let text = child.textContent
  let reducedText = text.substring(0, text.length - 3)
  child.textContent = reducedText
  if (child.offsetHeight > el.offsetHeight) {
    reduceText(el, child)
    return
  }

  reducedText += '...'
  el.removeChild(child)
  el.textContent = reducedText
}
