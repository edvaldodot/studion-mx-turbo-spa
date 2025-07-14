import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import { parse } from '@/support/payloadParser'
import qs from 'qs'

export const getOverallProgress = ({ categoryId, resources }) => {
  let query = {
    filter: {
      resources: resources.join(','),
    },
  }

  if (categoryId) {
    query['filter']['category_id'] = categoryId
  }

  return http.get(`myself/user-overall-progress?${createQuery(query)}`)
}

export const getOverallProgressContent = ({
  isStudent,
  categoryId,
  filterWithoutStatusList,
  resources,
}) => {
  let query = {}
  let queryParams = {
    page: 1,
    limit: 7,
    filter: {
      resources: resources.join(','),
    },
  }

  queryParams['filter']['without_status'] = filterWithoutStatusList

  if (categoryId > 0) {
    queryParams['filter']['categories'] = [categoryId]
  }

  queryParams['filter']['session_team_only'] = !isStudent ? 1 : 0
  queryParams['filter']['enrolled_only'] = isStudent ? 1 : 0
  queryParams['filter']['view'] = 'dashboard'

  query = createQuery(queryParams)

  return http.get(`myself/my-progress?${query}`, {
    headers: {
      'X-Accept-Version': 'v2',
    },
  })
}

export const getCategories = (params) => {
  return http.get(`/categories?${createQuery(params)}`)
}

export const getFeaturedCategories = () => {
  return http.get('/featured-categories?page=1&limit=1000')
}

export const convertArrayOfObjects = (arr, objectName) => {
  const params = arr.reduce((acum, current, index) => {
    const content = {}
    const keys = Object.keys(current)

    keys.forEach((key) => {
      let newKey
      newKey = `${objectName}[${index}][${key}]`
      content[newKey] = current[key]
    })

    return { ...acum, ...content }
  }, {})

  return qs.stringify(params)
}

export const updateFeaturedCategoriesPositions = (orderedCategories) => {
  const categories = orderedCategories.map(({ id, position }) => ({ id, position }))

  return http.put(
    '/featured-categories/batch',
    convertArrayOfObjects(categories, 'featured_category')
  )
}

export const saveFeaturedCategories = (categories) => {
  const categoryIds = categories.map(({ id }) => id)
  const payload = parse({ categories_id: categoryIds })
  return http.post('/featured-categories', payload)
}

export const deleteFeaturedCategory = (id) => {
  return http.delete(`/featured-categories/${id}`)
}

export const getNewsContent = (params) => {
  return http.get(`offerings?${createQuery(params)}`, {
    headers: {
      'X-Accept-Version': 'v2',
    },
  })
}