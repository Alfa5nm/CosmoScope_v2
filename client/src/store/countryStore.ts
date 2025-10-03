import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PointOfInterest = {
  id: string
  name: string
  description: string
  coordinates: [number, number] // [lng, lat]
  category: 'landmark' | 'natural' | 'cultural' | 'historical' | 'modern'
  imageUrl?: string
  countryCode: string
  rating?: number
  visitorsPerYear?: number
  established?: string
  website?: string
}

export type Country = {
  code: string // ISO 3166-1 alpha-2
  name: string
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  center: [number, number] // [lng, lat]
  capital?: string
  population?: number
  area?: number // km²
  continent: string
  pointsOfInterest: PointOfInterest[]
}

export type CountryState = {
  // State
  isEnabled: boolean
  selectedCountry: string | null
  selectedPOI: string | null
  hoveredCountry: string | null
  showPOICards: boolean
  
  // Data
  countries: Country[]
  
  // Actions
  toggleCountryLayer: () => void
  setSelectedCountry: (countryCode: string | null) => void
  setSelectedPOI: (poiId: string | null) => void
  setHoveredCountry: (countryCode: string | null) => void
  setShowPOICards: (show: boolean) => void
  getCountryByCode: (code: string) => Country | undefined
  getPOIById: (id: string) => PointOfInterest | undefined
  getCountriesWithPOI: () => Country[]
  addPOI: (countryCode: string, poi: Omit<PointOfInterest, 'id' | 'countryCode'>) => void
  updatePOI: (poiId: string, updates: Partial<PointOfInterest>) => void
  deletePOI: (poiId: string) => void
  loadCountryData: (countries: Country[]) => void
}

// Sample POI data for major countries
const sampleCountries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    bounds: { north: 71.5, south: 18.9, east: -66.9, west: 172.4 },
    center: [-95.7129, 37.0902],
    capital: 'Washington, D.C.',
    population: 331900000,
    area: 9833517,
    continent: 'North America',
    pointsOfInterest: [
      {
        id: 'poi_statue_liberty',
        name: 'Statue of Liberty',
        description: 'A colossal neoclassical sculpture on Liberty Island in New York Harbor, a symbol of freedom and democracy.',
        coordinates: [-74.0445, 40.6892],
        category: 'landmark',
        imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400',
        countryCode: 'US',
        rating: 4.5,
        visitorsPerYear: 4000000,
        established: '1886'
      },
      {
        id: 'poi_grand_canyon',
        name: 'Grand Canyon',
        description: 'A steep-sided canyon carved by the Colorado River, one of the most spectacular natural wonders in the world.',
        coordinates: [-112.1401, 36.0544],
        category: 'natural',
        imageUrl: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=400',
        countryCode: 'US',
        rating: 4.8,
        visitorsPerYear: 6000000,
        established: '1919'
      },
      {
        id: 'poi_golden_gate',
        name: 'Golden Gate Bridge',
        description: 'An iconic suspension bridge spanning the Golden Gate strait, connecting San Francisco to Marin County.',
        coordinates: [-122.4783, 37.8199],
        category: 'landmark',
        imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
        countryCode: 'US',
        rating: 4.7,
        visitorsPerYear: 15000000,
        established: '1937'
      }
    ]
  },
  {
    code: 'FR',
    name: 'France',
    bounds: { north: 51.1, south: 41.3, east: 9.6, west: -5.1 },
    center: [2.2137, 46.2276],
    capital: 'Paris',
    population: 67400000,
    area: 643801,
    continent: 'Europe',
    pointsOfInterest: [
      {
        id: 'poi_eiffel_tower',
        name: 'Eiffel Tower',
        description: 'A wrought-iron lattice tower and iconic symbol of Paris, built for the 1889 World\'s Fair.',
        coordinates: [2.2945, 48.8584],
        category: 'landmark',
        imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400',
        countryCode: 'FR',
        rating: 4.6,
        visitorsPerYear: 7000000,
        established: '1889'
      },
      {
        id: 'poi_louvre',
        name: 'Louvre Museum',
        description: 'The world\'s largest art museum and historic monument, home to the Mona Lisa and countless masterpieces.',
        coordinates: [2.3376, 48.8606],
        category: 'cultural',
        imageUrl: 'https://images.unsplash.com/photo-1566139884542-0c3f8b0b2c84?w=400',
        countryCode: 'FR',
        rating: 4.5,
        visitorsPerYear: 10000000,
        established: '1793'
      }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    bounds: { north: 45.5, south: 24.2, east: 145.8, west: 122.9 },
    center: [138.2529, 36.2048],
    capital: 'Tokyo',
    population: 125800000,
    area: 377975,
    continent: 'Asia',
    pointsOfInterest: [
      {
        id: 'poi_mount_fuji',
        name: 'Mount Fuji',
        description: 'Japan\'s highest mountain and sacred symbol, an active stratovolcano with perfect conical shape.',
        coordinates: [138.7274, 35.3606],
        category: 'natural',
        imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400',
        countryCode: 'JP',
        rating: 4.8,
        visitorsPerYear: 300000,
        established: 'Ancient'
      },
      {
        id: 'poi_tokyo_tower',
        name: 'Tokyo Tower',
        description: 'A communications tower inspired by the Eiffel Tower, offering panoramic views of Tokyo.',
        coordinates: [139.7454, 35.6586],
        category: 'landmark',
        imageUrl: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400',
        countryCode: 'JP',
        rating: 4.3,
        visitorsPerYear: 2500000,
        established: '1958'
      }
    ]
  },
  {
    code: 'EG',
    name: 'Egypt',
    bounds: { north: 31.7, south: 22.0, east: 36.9, west: 25.0 },
    center: [30.8025, 26.8206],
    capital: 'Cairo',
    population: 102300000,
    area: 1001449,
    continent: 'Africa',
    pointsOfInterest: [
      {
        id: 'poi_pyramids_giza',
        name: 'Pyramids of Giza',
        description: 'Ancient pyramid complex including the Great Pyramid, one of the Seven Wonders of the Ancient World.',
        coordinates: [31.1342, 29.9792],
        category: 'historical',
        imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400',
        countryCode: 'EG',
        rating: 4.9,
        visitorsPerYear: 14700000,
        established: '2580 BC'
      }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    bounds: { north: -9.2, south: -54.8, east: 159.1, west: 112.9 },
    center: [133.7751, -25.2744],
    capital: 'Canberra',
    population: 25700000,
    area: 7692024,
    continent: 'Oceania',
    pointsOfInterest: [
      {
        id: 'poi_sydney_opera',
        name: 'Sydney Opera House',
        description: 'A multi-venue performing arts center with distinctive shell-shaped design, UNESCO World Heritage Site.',
        coordinates: [151.2153, -33.8568],
        category: 'cultural',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        countryCode: 'AU',
        rating: 4.6,
        visitorsPerYear: 8200000,
        established: '1973'
      },
      {
        id: 'poi_uluru',
        name: 'Uluru (Ayers Rock)',
        description: 'A massive sandstone monolith sacred to Aboriginal people, rising dramatically from the desert.',
        coordinates: [131.0369, -25.3444],
        category: 'natural',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        countryCode: 'AU',
        rating: 4.7,
        visitorsPerYear: 300000,
        established: 'Ancient'
      }
    ]
  }
]

const generateId = () => `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useCountryStore = create<CountryState>()(
  persist(
    (set, get) => ({
      // Initial state
      isEnabled: false,
      selectedCountry: null,
      selectedPOI: null,
      hoveredCountry: null,
      showPOICards: true,
      countries: sampleCountries,

      // Actions
      toggleCountryLayer: () => {
        set(state => ({ 
          isEnabled: !state.isEnabled,
          selectedCountry: null,
          selectedPOI: null,
          hoveredCountry: null
        }))
      },

      setSelectedCountry: (countryCode) => {
        set({ selectedCountry: countryCode, selectedPOI: null })
      },

      setSelectedPOI: (poiId) => {
        set({ selectedPOI: poiId })
      },

      setHoveredCountry: (countryCode) => {
        set({ hoveredCountry: countryCode })
      },

      setShowPOICards: (show) => {
        set({ showPOICards: show })
      },

      getCountryByCode: (code) => {
        return get().countries.find(country => country.code === code)
      },

      getPOIById: (id) => {
        const countries = get().countries
        for (const country of countries) {
          const poi = country.pointsOfInterest.find(p => p.id === id)
          if (poi) return poi
        }
        return undefined
      },

      getCountriesWithPOI: () => {
        return get().countries.filter(country => country.pointsOfInterest.length > 0)
      },

      addPOI: (countryCode, poiData) => {
        const poi: PointOfInterest = {
          ...poiData,
          id: generateId(),
          countryCode
        }
        
        set(state => ({
          countries: state.countries.map(country => 
            country.code === countryCode
              ? { ...country, pointsOfInterest: [...country.pointsOfInterest, poi] }
              : country
          )
        }))
      },

      updatePOI: (poiId, updates) => {
        set(state => ({
          countries: state.countries.map(country => ({
            ...country,
            pointsOfInterest: country.pointsOfInterest.map(poi => 
              poi.id === poiId ? { ...poi, ...updates } : poi
            )
          }))
        }))
      },

      deletePOI: (poiId) => {
        set(state => ({
          countries: state.countries.map(country => ({
            ...country,
            pointsOfInterest: country.pointsOfInterest.filter(poi => poi.id !== poiId)
          }))
        }))
      },

      loadCountryData: (countries) => {
        set({ countries })
      }
    }),
    {
      name: 'cosmoscope-countries',
      version: 1
    }
  )
)


