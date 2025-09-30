import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPlanetConfig, type PlanetId, type LayerId } from '../config/planetLayers'

const todayISO = () => new Date().toISOString().split('T')[0]

export type ViewState = {
  planetId: PlanetId | null
  layerId: LayerId
  date: string
  setPlanet: (planet: PlanetId | null) => void
  setLayer: (layer: LayerId) => void
  setDate: (date: string) => void
}

const defaultLayer: LayerId = 'base'

export const useViewStore = create<ViewState>()(
  persist(
    (set, get) => ({
      planetId: null,
      layerId: defaultLayer,
      date: todayISO(),
      setPlanet: (planet) => {
        if (!planet) {
          set({ planetId: null, layerId: defaultLayer })
          return
        }
        const config = getPlanetConfig(planet)
        const currentLayer = get().layerId
        const nextLayer = config.layers.some(layer => layer.id === currentLayer)
          ? currentLayer
          : config.defaultLayer
        set({ planetId: planet, layerId: nextLayer })
      },
      setLayer: (layer) => {
        const planet = get().planetId
        if (!planet) {
          set({ layerId: layer })
          return
        }
        const config = getPlanetConfig(planet)
        const nextLayer = config.layers.some(item => item.id === layer)
          ? layer
          : config.defaultLayer
        set({ layerId: nextLayer })
      },
      setDate: (date) => {
        set({ date })
      }
    }),
    {
      name: 'cosmoscope_view',
      version: 1
    }
  )
)
