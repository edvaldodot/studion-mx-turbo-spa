const ModalAttendanceList = () => import('./pages/ModalAttendanceList')
const ModalManageAttendanceList = () => import('./pages/ModalManageAttendanceList')
const AttendanceList = () => import('./pages/AttendanceList')
const ModalRemoveAttendanceList = () => import('./pages/ModalRemoveAttendanceList')

export const routes = [
  {
    path: '/classroom/:session_uuid/attendance',
    name: 'classroom.attendance',
    component: AttendanceList,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'apply/:id',
        name: 'classroom.attendance.apply',
        component: ModalAttendanceList,
        meta: {
          modalCloseLink: { name: 'classroom.attendance' }
        }
      },
      {
        path: 'create',
        name: 'classroom.attendance.create',
        component: ModalManageAttendanceList,
        meta: {
          modalCloseLink: { name: 'classroom.attendance' }
        }
      },
      {
        path: 'edit/:id',
        name: 'classroom.attendance.edit',
        component: ModalManageAttendanceList,
        meta: {
          modalCloseLink: { name: 'classroom.attendance' }
        }
      },
      {
        path: 'remove/:id',
        name: 'classroom.attendance.remove',
        component: ModalRemoveAttendanceList,
        meta: {
          modalCloseLink: { name: 'classroom.attendance' }
        }
      }
    ]
  }
]
