const NotesList = () => import('./pages/NotesList')
const NoteCreate = () => import('./pages/NoteCreate')

export const routes = [
  {
    path: '/classroom/:session_uuid/notes',
    name: 'classroom.notes',
    component: NotesList,
    meta: {
      requiresAuth: true,
      group: 'notes',
    },
  },
  {
    path: '/classroom/:session_uuid/notes/create',
    name: 'classroom.notes.create',
    component: NoteCreate,
    meta: {
      requiresAuth: true,
      group: 'notes',
    },
  },
  {
    path: '/classroom/:session_uuid/notes/edit/:id',
    name: 'classroom.notes.edit',
    component: NoteCreate,
    meta: {
      requiresAuth: true,
      group: 'notes',
    },
    props: {
      isEditing: true,
    },
  },
]
