export const smoothScrollTo = (elementId) => {
  if (elementId === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const element = document.getElementById(elementId)
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
