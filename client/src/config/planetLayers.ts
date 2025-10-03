export type PlanetId = 'earth' | 'mars' | 'moon'

export type LayerId = string

export type LayerCategory =
  | 'basemap'
  | 'elevation'
  | 'night'
  | 'analysis'
  | 'partner'
  | 'science'
  | 'terrain'

export type PlanetLayerConfig = {
  id: LayerId
  name: string
  description: string
  supportsTime: boolean
  minZoom: number
  maxZoom: number
  category: LayerCategory
  metadata?: {
    provider?: string
    sourceUrl?: string
    citation?: string
    spatialResolution?: string
    temporalCoverage?: string
    tags?: string[]
    notes?: string
  }
  legendTitle?: string
  legendDescription?: string
  legendUrl?: string
  // Server-side metadata
  serverType?: 'gibs' | 'arcgis-image' | 'iiif' | 'wms'
  serverLayer?: string
  serverEndpoint?: string
  tileMatrixSet?: string
  format?: string
  defaultTime?: string
  wmsStyles?: string
  wmsVersion?: string
  additionalParams?: Record<string, string>
}

export type PlanetConfig = {
  defaultLayer: LayerId
  layers: PlanetLayerConfig[]
}

const catalog: Record<PlanetId, PlanetConfig> = {
  earth: {
    defaultLayer: 'base',
    layers: [
      {
        id: 'base',
        name: 'Blue Marble',
        description: 'Natural color imagery from MODIS Terra',
        supportsTime: true,
        minZoom: 0,
        maxZoom: 8,
        category: 'basemap',
        metadata: {
          provider: 'NASA GIBS / Earthdata',
          sourceUrl: 'https://gibs.earthdata.nasa.gov',
          spatialResolution: '250 m',
          temporalCoverage: 'Daily',
          tags: ['visible', 'true-color']
        },
        serverType: 'gibs',
        serverLayer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
        tileMatrixSet: 'EPSG4326_250m',
        format: 'jpeg'
      },
      {
        id: 'thermal',
        name: 'Thermal Anomalies',
        description: 'Daytime surface air temperature from AIRS',
        supportsTime: true,
        minZoom: 0,
        maxZoom: 5,
        category: 'analysis',
        metadata: {
          provider: 'NASA GIBS / AIRS',
          sourceUrl: 'https://gibs.earthdata.nasa.gov',
          spatialResolution: '2 km',
          temporalCoverage: 'Daily',
          tags: ['infrared', 'temperature']
        },
        serverType: 'gibs',
        serverLayer: 'AIRS_L3_Surface_Air_Temperature_Daily_Day',
        tileMatrixSet: 'EPSG4326_2km',
        format: 'png',
        defaultTime: '2021-02-01'
      },
      {
        id: 'elevation',
        name: 'Blue Marble Relief',
        description: 'Shaded relief with bathymetry from Blue Marble',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 8,
        category: 'terrain',
        metadata: {
          provider: 'NASA GIBS / Blue Marble',
          sourceUrl: 'https://gibs.earthdata.nasa.gov',
          spatialResolution: '500 m',
          tags: ['topography', 'relief', 'bathymetry']
        },
        serverType: 'gibs',
        serverLayer: 'BlueMarble_ShadedRelief_Bathymetry',
        tileMatrixSet: 'EPSG4326_500m',
        format: 'jpeg'
      },
      {
        id: 'night',
        name: 'Night Lights',
        description: 'Global night-time illumination (VIIRS)',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 7,
        category: 'night',
        metadata: {
          provider: 'NASA GIBS / VIIRS',
          sourceUrl: 'https://gibs.earthdata.nasa.gov',
          spatialResolution: '500 m',
          temporalCoverage: '2012 composite',
          tags: ['night', 'urbanization']
        },
        serverType: 'gibs',
        serverLayer: 'VIIRS_CityLights_2012',
        tileMatrixSet: 'EPSG4326_500m',
        format: 'jpeg',
        defaultTime: '2012-01-01'
      },
      {
        id: 'cwfis-active-fires',
        name: 'Active Fires (Canada)',
        description: 'Operational wildfire detections reported by Canadian agencies',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 10,
        category: 'partner',
        metadata: {
          provider: 'Canadian Forest Service (CWFIS)',
          sourceUrl: 'https://cwfis.cfs.nrcan.gc.ca',
          temporalCoverage: 'Updated daily',
          tags: ['wildfire', 'canada']
        },
        legendTitle: 'Active fire points',
        legendUrl: 'https://cwfis.cfs.nrcan.gc.ca/geoserver/public/ows?service=WMS&request=GetLegendGraphic&layer=activefires_current&format=image/png',
        serverType: 'wms',
        serverEndpoint: 'https://cwfis.cfs.nrcan.gc.ca/geoserver/public/ows',
        serverLayer: 'activefires_current',
        format: 'image/png',
        wmsStyles: '',
        wmsVersion: '1.1.1',
        additionalParams: {
          transparent: 'true'
        }
      }
    ]
  },
  mars: {
    defaultLayer: 'base',
    layers: [
      {
        id: 'base',
        name: 'CTX Mosaic',
        description: 'Mars global visible mosaic',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 9,
        category: 'basemap',
        metadata: {
          provider: 'NASA JPL / Solar System Treks',
          sourceUrl: 'https://trek.nasa.gov/mars',
          spatialResolution: '232 m',
          tags: ['visible', 'mosaic']
        },
        serverType: 'arcgis-image',
        serverEndpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_Viking_MDIM21_ClrMosaic_global_232m/ImageServer',
        format: 'PNG'
      },
      {
        id: 'thermal',
        name: 'MOLA Colorized',
        description: 'Colorized Mars elevation from MOLA',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 8,
        category: 'analysis',
        metadata: {
          provider: 'NASA GSFC / Solar System Treks',
          sourceUrl: 'https://trek.nasa.gov/mars',
          spatialResolution: '463 m',
          tags: ['altimetry', 'elevation']
        },
        serverType: 'arcgis-image',
        serverEndpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MGS_MOLA_Colorized_DEM_Global_463m/ImageServer',
        format: 'PNG'
      },
      {
        id: 'elevation',
        name: 'MOLA Elevation',
        description: 'High-resolution MOLA elevation',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 9,
        category: 'terrain',
        metadata: {
          provider: 'NASA GSFC / Solar System Treks',
          sourceUrl: 'https://trek.nasa.gov/mars',
          spatialResolution: '128-64 m',
          tags: ['elevation', 'terrain']
        },
        serverType: 'arcgis-image',
        serverEndpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/mola128_mola64_merge_90Nto90S_SimpleC_clon0/ImageServer',
        format: 'PNG32'
      },
      {
        id: 'night',
        name: 'Topography',
        description: 'Alternate shaded relief',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 8,
        category: 'terrain',
        metadata: {
          provider: 'NASA GSFC / Solar System Treks',
          sourceUrl: 'https://trek.nasa.gov/mars',
          spatialResolution: '463 m',
          tags: ['relief', 'hillshade']
        },
        serverType: 'arcgis-image',
        serverEndpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MGS_MOLA_Colorized_DEM_Global_463m/ImageServer',
        format: 'PNG'
      }
    ]
  },
  moon: {
    defaultLayer: 'base',
    layers: [
      {
        id: 'base',
        name: 'LROC WAC',
        description: 'Global lunar imaging',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 10,
        category: 'basemap',
        metadata: {
          provider: 'NASA LRO / Solar System Treks',
          sourceUrl: 'https://trek.nasa.gov/moon',
          spatialResolution: '303 m',
          tags: ['lunar', 'visible']
        },
        serverType: 'arcgis-image',
        serverEndpoint: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_Global_303ppd_v02/ImageServer',
        format: 'PNG'
      },
      {
        id: 'elevation',
        name: 'LOLA Elevation',
        description: 'LOLA digital elevation model',
        supportsTime: false,
        minZoom: 0,
        maxZoom: 10,
        category: 'terrain',
        metadata: {
          provider: 'NASA LRO / Solar System Treks',
          sourceUrl: 'https://trek.nasa.gov/moon',
          spatialResolution: '256 m',
          tags: ['elevation', 'terrain']
        },
        serverType: 'arcgis-image',
        serverEndpoint: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_Global_256ppd_v06/ImageServer',
        format: 'PNG32'
      }
    ]
  }
}

const DEFAULT_LIMITS = { min: 0, max: 8 }

export const getPlanetConfig = (planet: PlanetId): PlanetConfig => catalog[planet]

export const getLayerConfig = (planet: PlanetId, layerId: LayerId): PlanetLayerConfig | undefined =>
  catalog[planet]?.layers.find(layer => layer.id === layerId)

export const getLayerList = (planet: PlanetId): PlanetLayerConfig[] => catalog[planet]?.layers ?? []

export const layerSupportsTime = (planet: PlanetId, layerId: LayerId): boolean =>
  Boolean(getLayerConfig(planet, layerId)?.supportsTime)

export const getLayerZoomLimits = (planet: PlanetId, layerId: LayerId) => {
  const layer = getLayerConfig(planet, layerId)
  return layer ? { min: layer.minZoom, max: layer.maxZoom } : { ...DEFAULT_LIMITS }
}

export const getFullCatalog = () => catalog

export const getServerConfig = (planet: PlanetId, layerId: LayerId) => {
  const layer = getLayerConfig(planet, layerId)
  if (!layer) return null

  return {
    type: layer.serverType,
    layer: layer.serverLayer,
    endpoint: layer.serverEndpoint,
    tileMatrixSet: layer.tileMatrixSet,
    format: layer.format,
    defaultTime: layer.defaultTime,
    minZoom: layer.minZoom,
    maxZoom: layer.maxZoom,
    supportsTime: layer.supportsTime,
    styles: layer.wmsStyles,
    version: layer.wmsVersion,
    additionalParams: layer.additionalParams
  }
}
