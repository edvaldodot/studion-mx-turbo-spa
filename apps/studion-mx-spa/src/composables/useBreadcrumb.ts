import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJourneyStore } from '@/stores/journeyStore'

interface Breadcrumb {
  key: string
  text: string
  path: string
}

export function useBreadcrumb() {
  const list = ref<Breadcrumb[]>([])
  const route = useRoute()
  const router = useRouter()
  const journeyStore = useJourneyStore()

  const journeyId = computed(() => route.params.journeyId || route.path.split('/')[2])
  const classroomId = computed(() => route.params.classroomId || route.path.split('/')[3])
  const contentId = computed(() => route.query.currentContentUuid)

  function updateBreadcrumbs(): void {
    const breadcrumbs: Breadcrumb[] = []

    const externalBaseUrl = import.meta.env.VITE_URL_STUDION_SPA + '/journeys/management'

    if (externalBaseUrl && journeyId.value && classroomId.value) {
      breadcrumbs.push({
        key: 'courses',
        text: 'Meus Cursos',
        path: `${import.meta.env.VITE_URL_STUDION_SPA}/classroom/journeys`,
      })
    }

    if (journeyStore.getClassroom?.journey?.name && journeyId.value && classroomId.value) {
      breadcrumbs.push({
        key: 'journey',
        text: journeyStore.getClassroom.journey.name,
        path: `/classroom-v2/${journeyId.value}/${classroomId.value}`,
      })
    }

    if (journeyStore.getClassroom?.session?.name && journeyId.value && classroomId.value) {
      breadcrumbs.push({
        key: 'classroom',
        text: journeyStore.getClassroom.session.name,
        path: `/classroom-v2/${journeyId.value}/${classroomId.value}`,
      })
    }

    // TODO: SOLICITAR AO BACK PARA MANDAR O NAME DO COMPONENT
    const componentName = journeyStore.getCurrentContent?.component?.name
    if (componentName && contentId.value) {
      breadcrumbs.push({
        key: 'content',
        text: componentName,
        path: route.fullPath,
      })
    }

    list.value = breadcrumbs
  }

  function handleNavigate(path: unknown): void {
    const safePath = path as string

    if (safePath.startsWith('http')) {
      window.location.href = safePath
    } else {
      router.push(safePath)
    }
  }

  watch(
    () => route.fullPath,
    updateBreadcrumbs,
    { immediate: true }
  )

  return {
    list,
    handleNavigate,
    journeyId,
    classroomId,
    contentId,
    updateBreadcrumbs
  }

}
