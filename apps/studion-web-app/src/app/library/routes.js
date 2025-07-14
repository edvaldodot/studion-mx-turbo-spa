import beforeEnterLibrary from './beforeEnter'

const LibraryList = () => import('./pages/LibraryList')
const LibrarySolutions = () => import('./pages/LibrarySolutions')

export default [
  {
    name: 'library.index',
    path: '/library',
    redirect: { name: 'library.all' },
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'library.all',
    path: '/library/all',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      group: 'library',
      description: 'global:route.library.index',
    },
  },
  {
    name: 'library.folder',
    path: '/library/folder/:id',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      group: 'library',
      description: 'library:page.folder.description',
    },
    beforeEnter: beforeEnterLibrary,
  },
  {
    name: 'library.all.create',
    path: '/library/all/create',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      modalMediaActive: true,
    },
    beforeEnter: beforeEnterLibrary,
  },
  {
    name: 'library.all.edit',
    path: '/library/all/edit/:id',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      editing: true,
      modalMediaActive: true,
    },
    beforeEnter: beforeEnterLibrary,
  },
  {
    name: 'library.all.preview',
    path: '/library/all/preview/:id',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      editing: true,
      modalPreviewActive: true,
      modalCloseLink: { name: 'library.all' },
    },
    beforeEnter: beforeEnterLibrary,
  },
  {
    name: 'library.all.delete',
    path: '/library/all/delete/:id',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      editing: true,
      modalConfirmActive: true,
    },
    beforeEnter: beforeEnterLibrary,
  },
  {
    name: 'library.solutions',
    path: '/library/solutions',
    component: LibrarySolutions,
    meta: {
      requiresAuth: true,
      group: 'library',
      description: 'global:route.library.solutions',
    },
  },
  {
    name: 'library.all.create.folder',
    path: '/library/all/create/folder',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      isFolderModal: true,
    },
    beforeEnter: beforeEnterLibrary,
  },
  {
    name: 'library.all.edit.folder',
    path: '/library/all/edit/folder/:id',
    component: LibraryList,
    meta: {
      requiresAuth: true,
      editing: true,
      isFolderModal: true,
    },
    beforeEnter: beforeEnterLibrary,
  },
]
