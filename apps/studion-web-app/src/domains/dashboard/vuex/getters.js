export const hasNewsContent = (state) => {
  return (state.newsContent || []).length
}