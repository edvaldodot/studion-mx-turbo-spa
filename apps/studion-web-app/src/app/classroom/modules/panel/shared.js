export const createTabLinks = (hiddenTools, dinamicDisableTools = {}) => {
  return [
    {
      text: 'classroom.panel:tab.link.1',
      location: {
        name: 'classroom.panel.dashboard',
      },
    },
    {
      disabled: dinamicDisableTools.announcement,
      text: 'classroom.panel:tab.link.2',
      location: {
        name: 'classroom.panel.announcements',
      },
    },
    {
      text: 'classroom.panel:tab.link.3',
      disabled: hiddenTools.indexOf('997') !== -1,
      location: {
        name: 'classroom.panel.calendar',
      },
    },
  ]
}
