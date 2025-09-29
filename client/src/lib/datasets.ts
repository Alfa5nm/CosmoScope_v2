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

export const datasets: Record<string, DatasetLayer[]> = {
  earth: [
    {
      id: 'earth-blue-marble',
      title: 'Blue Marble',
      type: 'base',
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: true,
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
      hasTime: false,
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
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: true,
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
      hasTime: false,
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
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'LRO_LROC_WAC_Global_303m',
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: false,
      attribution: 'NASA/GSFC/Arizona State University',
      minZoom: 0,
      maxZoom: 10,
      opacity: 1,
      visible: true,
      planet: 'moon',
      description: 'Lunar Reconnaissance Orbiter Camera Wide Angle Camera'
    },
    {
      id: 'moon-elevation',
      title: 'Lunar Elevation',
      type: 'elevation',
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'LRO_LOLA_Global_LDEM_118m',
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: false,
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
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'MRO_CTX_Mosaic_Global_92m',
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: false,
      attribution: 'NASA/JPL-Caltech/MSSS',
      minZoom: 0,
      maxZoom: 8,
      opacity: 1,
      visible: true,
      planet: 'mars',
      description: 'Mars Reconnaissance Orbiter Context Camera'
    },
    {
      id: 'mars-elevation',
      title: 'Mars Elevation',
      type: 'elevation',
      url: 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi',
      layer: 'MGS_MOLA_BlendedShade_Global_128ppd',
      tileMatrixSet: 'EPSG4326_500m',
      hasTime: false,
      attribution: 'NASA/GSFC',
      minZoom: 0,
      maxZoom: 8,
      opacity: 0.6,
      visible: false,
      planet: 'mars',
      description: 'Mars Global Surveyor Mars Orbiter Laser Altimeter'
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
  let url = layer.url
  
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
