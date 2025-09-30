// Dynamic import utilities for heavy libraries

// Three.js dynamic import
export const loadThree = async () => {
  const three = await import('three')
  return three
}

// MapLibre GL dynamic import
export const loadMapLibre = async () => {
  const maplibregl = await import('maplibre-gl')
  // Import CSS dynamically
  await import('maplibre-gl/dist/maplibre-gl.css')
  return maplibregl
}

// Combined loader for components that need both
export const loadMapAndThree = async () => {
  const [three, maplibregl] = await Promise.all([
    loadThree(),
    loadMapLibre()
  ])
  return { three, maplibregl }
}

// Preload utilities for better UX
export const preloadLibraries = () => {
  // Preload Three.js for SolarSystem
  if (typeof window !== 'undefined') {
    import('three').catch(console.warn)
  }
}

// Library loading status
export const libraryStatus = {
  three: false,
  maplibre: false
}

// Mark libraries as loaded
export const markLibraryLoaded = (library: 'three' | 'maplibre') => {
  libraryStatus[library] = true
}
