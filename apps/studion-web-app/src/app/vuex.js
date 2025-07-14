import Auth from '@/domains/auth/vuex'
import Account from '@/domains/account/vuex'
import Attendance from '@/domains/attendance/vuex'
import users from '@/domains/users/vuex'
import Branches from '@/domains/branches/vuex'
import profiles from '@/domains/profiles/vuex'
import Sessions from '@/domains/sessions/vuex'
import Courses from '@/domains/courses/vuex'
import Certificates from '@/domains/certificates/vuex'
import forums from '@/domains/forums/vuex'
import offerings from '@/domains/offerings/vuex'
import Chats from '@/domains/chats/vuex'
import Polls from '@/domains/polls/vuex'
import Classroom from '@/domains/classroom/vuex'
import faqs from '@/domains/faqs/vuex'
import Kb from '@/domains/kb/vuex'
import announcements from '@/domains/announcements/vuex'
import Library from '@/domains/library/vuex'
import Messages from '@/domains/messages/vuex'
import Gamification from '@/domains/gamification/vuex'
import reports from '@/domains/reports/vuex'
import metadata from '@/domains/metadata/vuex'
import Settings from '@/domains/settings/vuex'
import likes from '@/domains/likes/vuex'
import Conferences from '@/domains/conferences/vuex'
import Medias from '@/domains/medias/vuex'
import AccessMessages from '@/domains/accessMessages/vuex'
import FeaturedContents from '@/domains/featuredContents/vuex'
import Dashboard from '@/domains/dashboard/vuex'
import Trails from '@/domains/trails/vuex'
import Groups from '@/domains/groups/vuex'
import Rating from '@/domains/rating/vuex'
import Categories from '@/domains/categories/vuex'
import Management from '@/domains/management/vuex'
import Mediation from '@/domains/mediation/vuex'
import Filters from '@/domains/filters/vuex'
import ai from '@/domains/ai/vuex'

const vuex = {
  Auth,
  Account,
  Attendance,
  users,
  Branches,
  profiles,
  Sessions,
  Courses,
  Certificates,
  forums,
  offerings,
  Chats,
  Classroom,
  Polls,
  faqs,
  Kb,
  announcements,
  Library,
  Messages,
  Gamification,
  reports,
  metadata,
  Settings,
  Conferences,
  likes,
  Medias,
  AccessMessages,
  FeaturedContents,
  Dashboard,
  Trails,
  Groups,
  Rating,
  Categories,
  Management,
  Mediation,
  Filters,
  ai,
}

const keys = Object.keys(vuex)
const modules = keys.reduce((acc, key) => ({ ...acc, [key]: vuex[key].module }), {})

export default { modules }
