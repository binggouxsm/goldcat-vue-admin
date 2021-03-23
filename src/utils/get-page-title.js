import defaultSettings from '@/settings'


const title = defaultSettings.title || 'Vue Element Admin'

export default function getPageTitle(key) {
  const hasKey = `route.${key}`
  if (hasKey) {
    const pageName = `route.${key}`
    return `${pageName} - ${title}`
  }
  return `${title}`
}
