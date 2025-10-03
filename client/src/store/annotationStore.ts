import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { usePointsStore } from './pointsStore'

export type AnnotationType = 'point' | 'area' | 'line' | 'text'

export type Annotation = {
  id: string
  type: AnnotationType
  planet: 'earth' | 'mars' | 'moon'
  title: string
  description?: string
  coordinates: number[] // [lng, lat] for point, [[lng, lat], ...] for area/line
  color: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  metadata?: Record<string, any>
}

export type AnnotationState = {
  // State
  isEnabled: boolean
  activeMode: AnnotationType | null
  annotations: Annotation[]
  selectedAnnotation: string | null
  isCreating: boolean
  tempCoordinates: number[]
  
  // Actions
  toggleAnnotationMode: () => void
  setActiveMode: (mode: AnnotationType | null) => void
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void
  deleteAnnotation: (id: string) => void
  selectAnnotation: (id: string | null) => void
  getAnnotationsByPlanet: (planet: string) => Annotation[]
  setTempCoordinates: (coords: number[]) => void
  setIsCreating: (creating: boolean) => void
  clearAnnotations: () => void
  exportAnnotations: () => string
  importAnnotations: (data: string) => void
}

const generateId = () => `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useAnnotationStore = create<AnnotationState>()(
  persist(
    (set, get) => ({
      // Initial state
      isEnabled: false,
      activeMode: null,
      annotations: [],
      selectedAnnotation: null,
      isCreating: false,
      tempCoordinates: [],

      // Actions
      toggleAnnotationMode: () => {
        set(state => ({ 
          isEnabled: !state.isEnabled,
          activeMode: state.isEnabled ? null : state.activeMode,
          selectedAnnotation: null,
          isCreating: false,
          tempCoordinates: []
        }))
      },

      setActiveMode: (mode) => {
        set({ 
          activeMode: mode,
          selectedAnnotation: null,
          isCreating: false,
          tempCoordinates: []
        })
      },

      addAnnotation: (annotationData) => {
        const annotation: Annotation = {
          ...annotationData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Award points for creating annotation
        usePointsStore.getState().addPoints(10, 'Annotation Created')
        
        set(state => ({
          annotations: [...state.annotations, annotation],
          isCreating: false,
          tempCoordinates: [],
          selectedAnnotation: annotation.id
        }))
      },

      updateAnnotation: (id, updates) => {
        // Award points for editing annotation
        usePointsStore.getState().addPoints(5, 'Annotation Edited')
        
        set(state => ({
          annotations: state.annotations.map(ann => 
            ann.id === id 
              ? { ...ann, ...updates, updatedAt: new Date().toISOString() }
              : ann
          )
        }))
      },

      deleteAnnotation: (id) => {
        // Award points for deleting annotation (negative points)
        usePointsStore.getState().addPoints(-2, 'Annotation Deleted')
        
        set(state => ({
          annotations: state.annotations.filter(ann => ann.id !== id),
          selectedAnnotation: state.selectedAnnotation === id ? null : state.selectedAnnotation
        }))
      },

      selectAnnotation: (id) => {
        set({ selectedAnnotation: id })
      },

      getAnnotationsByPlanet: (planet) => {
        return get().annotations.filter(ann => ann.planet === planet)
      },

      setTempCoordinates: (coords) => {
        set({ tempCoordinates: coords })
      },

      setIsCreating: (creating) => {
        set({ isCreating: creating })
      },

      clearAnnotations: () => {
        set({ 
          annotations: [],
          selectedAnnotation: null,
          isCreating: false,
          tempCoordinates: []
        })
      },

      exportAnnotations: () => {
        const data = {
          annotations: get().annotations,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
        return JSON.stringify(data, null, 2)
      },

      importAnnotations: (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.annotations && Array.isArray(parsed.annotations)) {
            set(state => ({
              annotations: [...state.annotations, ...parsed.annotations]
            }))
          }
        } catch (error) {
          console.error('Failed to import annotations:', error)
        }
      }
    }),
    {
      name: 'cosmoscope-annotations',
      version: 1
    }
  )
)



