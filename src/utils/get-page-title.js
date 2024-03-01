import defaultSettings from '@/settings'

const title = defaultSettings.title || '凌智一体化指挥调度实战平台'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
