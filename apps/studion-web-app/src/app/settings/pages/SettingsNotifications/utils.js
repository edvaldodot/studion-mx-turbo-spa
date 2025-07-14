/**
 * @typedef {Object} Notification
 * @property {number} id
 * @property {string} group
 * @property {string} alias
 * @property {boolean} active
 */

/**
 * receives an array of notifications and returns an object with the notifications
 * grouped by the group property
 * @param {Array<Notification>} notifications
 * @returns Object
 */
export const parseNotificationsByGroup = (notifications) => {
  return notifications.reduce((groups, notification) => {
    if (!groups[notification.group]) {
      groups[notification.group] = []
    }
    groups[notification.group].push(
      {
        id: notification.id,
        active: notification.active,
        alias: notification.alias
      }
    )
    return groups
  }, {})
}

/**
 * Receives an object with the notifications grouped by the group property
 * and returns an array with all the notifications
 * @param {Object} groupedNotifications
 * @returns Array<Notification>
 */
export const ungroupNotifications = (groupedNotifications) => {
  return Object.values(groupedNotifications).flat()
}
