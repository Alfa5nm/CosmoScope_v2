import { layerSupportsTime, type PlanetId, type LayerId } from '../config/planetLayers'

export interface DatasetLayer {
  id: string
  title: string
  type: 'base' | 'overlay' | 'elevation' | 'thermal' | 'night'
  url: string
  layer?: string
  tileMatrixSet?: string
  hasTime: boolean
  attribution: string
  minZoom?: number
  maxZoom?: number
  opacity?: number
  visible?: boolean
  planet: 'earth' | 'moon' | 'mars'
  description?: string
  dateRange?: {
    start: string
    end: string
  }
}

const supportsTime = (planet: PlanetId, layerId: LayerId) => layerSupportsTime(planet, layerId)

export const datasets: Record<string, DatasetLayer[]> = {
  earth: [
    {
      id: 'earth-blue-marble',
      title: 'Blue Marble',
      type: 'base',
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      tileMatrixSet: 'EPSG4326_250m',
      hasTime: supportsTime('earth', 'base'),
      attribution: 'NASA Earth Observatory',
      minZoom: 0,
      maxZoom: 8,
      opacity: 1,
      visible: true,
      planet: 'earth',
      description: 'Natural color imagery of Earth',
      dateRange: {
        start: '2000-01-01',
        end: new Date().toISOString().split('T')[0]
      }
    },
    {
      id: 'earth-night-lights',
      title: 'Night Lights',
      type: 'night',
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'VIIRS_CityLights_2012',
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: supportsTime('earth', 'night'),
      attribution: 'NASA Earth Observatory',
      minZoom: 0,
      maxZoom: 8,
      opacity: 0.8,
      visible: false,
      planet: 'earth',
      description: 'Earth at night showing city lights'
    },
    {
      id: 'earth-thermal',
      title: 'Thermal',
      type: 'thermal',
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'MODIS_Terra_Land_Surface_Temperature_Day',
      tileMatrixSet: 'EPSG4326_2km',
      hasTime: supportsTime('earth', 'thermal'),
      attribution: 'NASA Earth Observatory',
      minZoom: 0,
      maxZoom: 8,
      opacity: 0.7,
      visible: false,
      planet: 'earth',
      description: 'Land surface temperature',
      dateRange: {
        start: '2000-01-01',
        end: new Date().toISOString().split('T')[0]
      }
    },
    {
      id: 'earth-elevation',
      title: 'Elevation',
      type: 'elevation',
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'SRTM_DEM',
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: supportsTime('earth', 'elevation'),
      attribution: 'NASA Earth Observatory',
      minZoom: 0,
      maxZoom: 8,
      opacity: 0.6,
      visible: false,
      planet: 'earth',
      description: 'Digital elevation model'
    }
  ],
  moon: [
    {
      id: 'moon-lroc',
      title: 'LROC WAC',
      type: 'base',
      url: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_Global_303ppd_v02/ImageServer',
      hasTime: supportsTime('moon', 'base'),
      attribution: 'NASA/GSFC/Arizona State University',
      minZoom: 0,
      maxZoom: 10,
      opacity: 1,
      visible: true,
      planet: 'moon',
      description: 'Global mosaic from Lunar Reconnaissance Orbiter WAC'
    },
    {
      id: 'moon-elevation',
      title: 'Lunar Elevation',
      type: 'elevation',
      url: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_Global_256ppd_v06/ImageServer',
      hasTime: supportsTime('moon', 'elevation'),
      attribution: 'NASA/GSFC',
      minZoom: 0,
      maxZoom: 10,
      opacity: 0.6,
      visible: false,
      planet: 'moon',
      description: 'Lunar Orbiter Laser Altimeter elevation data'
    }
  ],
  mars: [
    {
      id: 'mars-ctx',
      title: 'Mars CTX',
      type: 'base',
      url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_Viking_MDIM21_ClrMosaic_global_232m/ImageServer',
      hasTime: supportsTime('mars', 'base'),
      attribution: 'NASA/JPL-Caltech/MSSS',
      minZoom: 0,
      maxZoom: 9,
      opacity: 1,
      visible: true,
      planet: 'mars',
      description: 'Global mosaic from Viking and MRO observations'
    },
    {
      id: 'mars-thermal',
      title: 'MOLA Colorized',
      type: 'thermal',
      url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MGS_MOLA_Colorized_DEM_Global_463m/ImageServer',
      hasTime: supportsTime('mars', 'thermal'),
      attribution: 'NASA/GSFC',
      minZoom: 0,
      maxZoom: 8,
      opacity: 0.8,
      visible: false,
      planet: 'mars',
      description: 'Colorized Mars Orbiter Laser Altimeter data'
    },
    {
      id: 'mars-elevation',
      title: 'Mars Elevation',
      type: 'elevation',
      url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/mola128_mola64_merge_90Nto90S_SimpleC_clon0/ImageServer',
      hasTime: supportsTime('mars', 'elevation'),
      attribution: 'NASA/GSFC',
      minZoom: 0,
      maxZoom: 9,
      opacity: 0.6,
      visible: false,
      planet: 'mars',
      description: 'Merged MOLA global elevation model'
    },
    {
      id: 'mars-night',
      title: 'Topography Shading',
      type: 'night',
      url: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MGS_MOLA_Colorized_DEM_Global_463m/ImageServer',
      hasTime: supportsTime('mars', 'night'),
      attribution: 'NASA/GSFC',
      minZoom: 0,
      maxZoom: 8,
      opacity: 0.7,
      visible: false,
      planet: 'mars',
      description: 'Alternate shaded relief based on MOLA data'
    }
  ]
}

export const getDatasetsForPlanet = (planet: string): DatasetLayer[] => {
  return datasets[planet] || []
}

export const getBaseLayer = (planet: string): DatasetLayer | undefined => {
  const planetDatasets = getDatasetsForPlanet(planet)
  return planetDatasets.find(layer => layer.type === 'base' && layer.visible)
}

export const getOverlayLayers = (planet: string): DatasetLayer[] => {
  const planetDatasets = getDatasetsForPlanet(planet)
  return planetDatasets.filter(layer => layer.type !== 'base' && layer.visible)
}

export const getLayerById = (planet: string, layerId: string): DatasetLayer | undefined => {
  const planetDatasets = getDatasetsForPlanet(planet)
  return planetDatasets.find(layer => layer.id === layerId)
}

export const buildTileUrl = (layer: DatasetLayer, x: number, y: number, z: number, date?: string): string => {
  const url = layer.url
  
  // Add standard WMTS parameters
  const params = new URLSearchParams({
    SERVICE: 'WMTS',
    REQUEST: 'GetTile',
    VERSION: '1.0.0',
    LAYER: layer.layer || '',
    STYLE: 'default',
    TILEMATRIXSET: layer.tileMatrixSet || 'EPSG4326_500m',
    TILEMATRIX: `EPSG4326_500m:${z}`,
    TILEROW: y.toString(),
    TILECOL: x.toString(),
    FORMAT: 'image/png'
  })
  
  // Add time parameter if layer supports it and date is provided
  if (layer.hasTime && date) {
    params.set('TIME', date)
  }
  
  return `${url}?${params.toString()}`
}

export const getAvailableDates = (layer: DatasetLayer): string[] => {
  if (!layer.hasTime || !layer.dateRange) {
    return []
  }
  
  const dates: string[] = []
  const start = new Date(layer.dateRange.start)
  const end = new Date(layer.dateRange.end)
  
  // Generate monthly dates for the range
  const current = new Date(start)
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setMonth(current.getMonth() + 1)
  }
  
  return dates
}

