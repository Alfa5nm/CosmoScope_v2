import { useState, useEffect, useCallback } from 'react'
import { objectiveManager, Objective, ObjectiveProgress } from '../objectiveSystem'

export const useObjectives = () => {
  const [progress, setProgress] = useState<ObjectiveProgress>(objectiveManager.getObjectiveProgress())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('cosmoscope-objectives')
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        // Restore completed objectives
        parsed.completedObjectives?.forEach((id: string) => {
          objectiveManager.completeObjective(id)
        })
        // Restore total points
        if (parsed.totalPoints) {
          // Note: This is a simplified restoration - in a real app you'd want more robust state management
        }
      } catch (error) {
        console.error('Failed to load objective progress:', error)
      }
    }
    
    setProgress(objectiveManager.getObjectiveProgress())
    setIsLoading(false)
  }, [])

  const updateProgress = useCallback((objectiveId: string, progress: number) => {
    const completed = objectiveManager.updateProgress(objectiveId, progress)
    if (completed) {
      setProgress(objectiveManager.getObjectiveProgress())
      saveProgress()
    }
    return completed
  }, [])

  const visitPlanet = useCallback((planetName: string) => {
    const completed = objectiveManager.visitPlanet(planetName)
    if (completed) {
      setProgress(objectiveManager.getObjectiveProgress())
      saveProgress()
    }
    return completed
  }, [])

  const completeObjective = useCallback((objectiveId: string) => {
    const completed = objectiveManager.completeObjective(objectiveId)
    if (completed) {
      setProgress(objectiveManager.getObjectiveProgress())
      saveProgress()
    }
    return completed
  }, [])

  const saveProgress = useCallback(() => {
    const currentProgress = objectiveManager.getObjectiveProgress()
    localStorage.setItem('cosmoscope-objectives', JSON.stringify({
      completedObjectives: currentProgress.completedObjectives,
      totalPoints: currentProgress.totalPoints
    }))
  }, [])

  const getCurrentObjective = useCallback(() => {
    return objectiveManager.getCurrentObjective()
  }, [])

  const getObjectiveById = useCallback((id: string) => {
    return objectiveManager.getObjectiveById(id)
  }, [])

  const getAllObjectives = useCallback(() => {
    return objectiveManager.getAllObjectives()
  }, [])

  const resetObjectives = useCallback(() => {
    objectiveManager.reset()
    setProgress(objectiveManager.getObjectiveProgress())
    localStorage.removeItem('cosmoscope-objectives')
  }, [])

  return {
    progress,
    isLoading,
    updateProgress,
    visitPlanet,
    completeObjective,
    getCurrentObjective,
    getObjectiveById,
    getAllObjectives,
    resetObjectives,
    saveProgress
  }
}
