const Library = () => import('./pages/Library')
const ModalAddFolder = () => import('./pages/ModalAddFolder')
const ModalAddMedia = () => import('./pages/ModalAddMedia')
export const routes = [
  {
    path: '/classroom/:session_uuid/library',
    name: 'classroom.sessionLibrary',
    component: Library,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/:parentId/add-folder',
        name: 'classroom.library.add.folder',
        component: ModalAddFolder,
        meta: {
          requiresAuth: true,
        },
        props: true
      },
      {
        path: '/classroom/:session_uuid/library/add-media',
        name: 'classroom.library.add.media',
        component: ModalAddMedia,
        meta: {
          requiresAuth: true,
        },
        props: true
      }
    ]
  },
  {
    path: '/classroom/:session_uuid/library/:folderId',
    name: 'classroom.library.folder',
    component: Library,
    meta: {
      requiresAuth: false
    }
  }
]
