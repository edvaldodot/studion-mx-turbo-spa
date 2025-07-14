import { journeysService } from '@/services'
import { defineStore } from 'pinia'
import type { Journey, Pagination, Classroom, JourneyWithComponents, Content } from '@/types'


export const useJourneyStore = defineStore('journey', {
    state: () => ({
        journeys: {} as Pagination<Journey[]>,
        classroom: {} as Classroom,
        components: {} as JourneyWithComponents,
        currentContent: {} as Content
    }),
    getters: {
        getJourneys: (state) => state.journeys,
        getClassroom: (state) => state.classroom,
        getComponents: (state) => state.components,
        getCurrentContent: (state) => state.currentContent
    },
    actions: {
        async setJourneys() {
            const response = await journeysService.fetchJourneys()
            this.journeys = response?.data
        },
        async setClassroom(journeyId: string, classroomId: string) {
            const response = await journeysService.fetchClassroomsByJourney(journeyId, classroomId)
            this.classroom = response?.data
        },
        async setComponents(journeyId: string, classroomId: string) {
            const response = await journeysService.fetchComponentsByClassrooms(journeyId, classroomId)
            this.components = response?.data
        },
        async setCurrentOpenContent(journeyId: string, classroomId: string, componentId: string) {
            const content = await journeysService.fetchComponentOpenById(journeyId, classroomId, componentId)
            this.currentContent = content?.data
        },
        async setConsumeContent(journeyId: string, classroomId: string, componentId: string, data: object) {
            await journeysService.putConsumeContentByID(journeyId, classroomId, componentId, data)
        }
    }
})
