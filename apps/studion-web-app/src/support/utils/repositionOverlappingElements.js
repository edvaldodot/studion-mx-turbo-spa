export function repositionElement(refElement, gapSize = 30) {
  const defaultDistance = {
    right: 20,
    bottom: 15,
  }
  const nonOverlappingElements = document.querySelectorAll('.non-overlapping-element')
  const buttonRect = refElement.getBoundingClientRect()

  let newButtonDistance = defaultDistance.bottom
  let isHorizontallyOverlapping = false
  let isVerticallyOverlapping = false

  nonOverlappingElements.forEach((element) => {
    const elementRect = element.getBoundingClientRect()
    const verticalGap = elementRect.top - buttonRect.bottom

    if (JSON.stringify(buttonRect) == JSON.stringify(elementRect)) return

    if (!isHorizontallyOverlapping) {
      isHorizontallyOverlapping =
        buttonRect.right + gapSize >= elementRect.left &&
        buttonRect.left - gapSize <= elementRect.right
    }

    if (!isVerticallyOverlapping) {
      isVerticallyOverlapping =
        buttonRect.bottom + gapSize >= elementRect.top &&
        buttonRect.top - gapSize <= elementRect.bottom
    }

    if (
      (isVerticallyOverlapping && isHorizontallyOverlapping) ||
      (!isVerticallyOverlapping && verticalGap != gapSize)
    ) {
      let currentDistance = window.innerHeight - elementRect.top + gapSize

      newButtonDistance = currentDistance > newButtonDistance ? currentDistance : newButtonDistance
    }

    if (!isHorizontallyOverlapping && !isVerticallyOverlapping) {
      newButtonDistance = defaultDistance.bottom
    }
  })

  return {
    right: `${defaultDistance.right}px`,
    bottom: `${newButtonDistance}px`,
  }
}
