export default {
  methods: {
    scrollToInputError (component = this) {
      const scrollOffset = 200
      const target = document.querySelector('.modal-blocker') || window
      const screenOffset = typeof target.scrollY === 'number' ? target.scrollY : target.scrollTop

      component = component.$el ? component.$el : component

      if (component.classList && component.classList.contains('has-error')) {
        let elTarget = component.getBoundingClientRect().y

        target.scrollTo({
          top: elTarget + screenOffset - scrollOffset,
          behavior: 'smooth'
        })

        return true
      }

      let focused = false
      let componentArray = Array.prototype.slice.call(component.childNodes)

      componentArray.some((childComponent) => {
        focused = this.scrollToInputError(childComponent)
        return focused
      })

      return focused
    }
  }
}
