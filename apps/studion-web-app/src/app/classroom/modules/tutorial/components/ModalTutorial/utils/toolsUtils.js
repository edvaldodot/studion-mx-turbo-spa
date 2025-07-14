/**
 * @desc Calculates the position of an element's box for tooltip or popover placement.
 * @param {HTMLElement} el
 * @param {boolean} mobile
 * @param {{ x: number, y: number }} offset
 *
 * @returns {{ x: number, y: number }}
 */
export const getElBoxPosition = (el, mobile = false, offset = { x: 10, y: 0 }) => {
  const rect = el.getBoundingClientRect()
  const tutorialBox = document.querySelector('.modal-tutorial')
  const tutorialBoxSize = tutorialBox ? tutorialBox.getBoundingClientRect().width : 300

  if (!mobile) {
    // If won't fit on screen, show in bottom
    const fitScreen = rect.x + rect.width + tutorialBoxSize < window.innerWidth

    if (!fitScreen) {
      return {
        x: rect.x + rect.width + offset.x - tutorialBoxSize,
        y: rect.y + rect.height + offset.y,
      }
    }

    return {
      x: rect.x + rect.width + offset.x,
      y: rect.y + offset.y,
    }
  } else {
    return {
      x: 0,
      y: rect.y + rect.height + offset.y + 10,
    }
  }
}
