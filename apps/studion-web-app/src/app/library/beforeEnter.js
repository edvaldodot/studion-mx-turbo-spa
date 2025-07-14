const validRoutes = [
  'library.all',
  'library.folder',
  'library.all.create',
  'library.all.edit',
  'library.all.preview',
  'library.all.delete',
  'library.all.create.folder',
  'library.all.edit.folder',
]

const beforeEnterLibrary = (to, from, next) => {
  if (validRoutes.includes(from.name)) {
    next()
  } else {
    next({ name: 'library.all' })
  }
}

export default beforeEnterLibrary
