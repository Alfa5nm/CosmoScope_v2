export interface Objective {
  id: string
  title: string
  description: string
  type: 'tutorial' | 'exploration' | 'discovery' | 'achievement' | 'mission'
  status: 'locked' | 'available' | 'active' | 'completed'
  requirements: string[]
  rewards: {
    points: number
    unlocks?: string[]
  }
  progress: {
    current: number
    total: number
  }
  planet?: string
  priority: 'high' | 'medium' | 'low'
}

export interface ObjectiveProgress {
  currentObjective: Objective | null
  completedObjectives: string[]
  availableObjectives: Objective[]
  totalPoints: number
  level: number
  nextLevelPoints: number
}

export const objectives: Objective[] = [
  // Tutorial Objectives
  {
    id: 'tutorial-001',
    title: 'Welcome to CosmoScope',
    description: 'Click on any planet in the solar system to learn navigation',
    type: 'tutorial',
    status: 'active',
    requirements: [],
    rewards: { points: 50, unlocks: ['tutorial-002'] },
    progress: { current: 0, total: 1 },
    priority: 'high'
  },
  {
    id: 'tutorial-002',
    title: 'First Planet Visit',
    description: 'Click on Earth, Mars, or Moon to travel to a planet surface',
    type: 'tutorial',
    status: 'locked',
    requirements: ['tutorial-001'],
    rewards: { points: 75, unlocks: ['exploration-001'] },
    progress: { current: 0, total: 1 },
    planet: 'earth',
    priority: 'high'
  },
  
  // Exploration Objectives
  {
    id: 'exploration-001',
    title: 'Planetary Explorer',
    description: 'Visit 3 different planets: Click Earth → Mars → Moon (or any 3 planets)',
    type: 'exploration',
    status: 'locked',
    requirements: ['tutorial-002'],
    rewards: { points: 150, unlocks: ['discovery-001'] },
    progress: { current: 0, total: 3 },
    priority: 'medium'
  },
  {
    id: 'exploration-002',
    title: 'Solar System Navigator',
    description: 'Visit all 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune',
    type: 'exploration',
    status: 'locked',
    requirements: ['exploration-001'],
    rewards: { points: 300, unlocks: ['achievement-001'] },
    progress: { current: 0, total: 8 },
    priority: 'medium'
  },
  
  // Discovery Objectives
  {
    id: 'discovery-001',
    title: 'Surface Investigator',
    description: 'On any planet: Click the annotation tool (pencil icon) → Click 5 different spots on the surface',
    type: 'discovery',
    status: 'locked',
    requirements: ['exploration-001'],
    rewards: { points: 200, unlocks: ['discovery-002'] },
    progress: { current: 0, total: 5 },
    priority: 'medium'
  },
  {
    id: 'discovery-002',
    title: 'Data Collector',
    description: 'Visit 10 different locations: Travel to different planets and click around to explore 10 unique spots',
    type: 'discovery',
    status: 'locked',
    requirements: ['discovery-001'],
    rewards: { points: 250, unlocks: ['achievement-002'] },
    progress: { current: 0, total: 10 },
    priority: 'medium'
  },
  
  // Achievement Objectives
  {
    id: 'achievement-001',
    title: 'Cosmic Scholar',
    description: 'Complete 10 objectives: Finish all tutorial, exploration, and discovery missions above',
    type: 'achievement',
    status: 'locked',
    requirements: ['exploration-002'],
    rewards: { points: 500, unlocks: ['mission-001'] },
    progress: { current: 0, total: 10 },
    priority: 'low'
  },
  {
    id: 'achievement-002',
    title: 'Master Explorer',
    description: 'Earn 1000 points: Complete missions, visit planets, and use annotation tools to accumulate points',
    type: 'achievement',
    status: 'locked',
    requirements: ['discovery-002'],
    rewards: { points: 1000, unlocks: ['mission-002'] },
    progress: { current: 0, total: 1000 },
    priority: 'low'
  },
  
  // Mission Objectives
  {
    id: 'mission-001',
    title: 'The Time Traveler\'s Journey',
    description: 'Visit Earth → Use annotation tool to mark 3 historical locations → Complete the time travel sequence',
    type: 'mission',
    status: 'locked',
    requirements: ['achievement-001'],
    rewards: { points: 750, unlocks: [] },
    progress: { current: 0, total: 5 },
    planet: 'earth',
    priority: 'high'
  },
  {
    id: 'mission-002',
    title: 'Mars Colony Investigation',
    description: 'Visit Mars → Use annotation tool to mark 4 potential colony sites → Analyze each location',
    type: 'mission',
    status: 'locked',
    requirements: ['achievement-002'],
    rewards: { points: 800, unlocks: [] },
    progress: { current: 0, total: 4 },
    planet: 'mars',
    priority: 'high'
  }
]

export class ObjectiveManager {
  private objectives: Objective[]
  private completedObjectives: Set<string>
  private currentObjective: Objective | null
  private totalPoints: number
  private visitedPlanets: Set<string>

  constructor() {
    this.objectives = [...objectives]
    this.completedObjectives = new Set()
    this.currentObjective = this.objectives.find(obj => obj.status === 'active') || null
    this.totalPoints = 0
    this.visitedPlanets = new Set()
  }

  getCurrentObjective(): Objective | null {
    return this.currentObjective
  }

  getObjectiveProgress(): ObjectiveProgress {
    const availableObjectives = this.objectives.filter(obj => 
      obj.status === 'available' || obj.status === 'active'
    )

    const level = Math.floor(this.totalPoints / 500) + 1
    const nextLevelPoints = level * 500

    return {
      currentObjective: this.currentObjective,
      completedObjectives: Array.from(this.completedObjectives),
      availableObjectives,
      totalPoints: this.totalPoints,
      level,
      nextLevelPoints
    }
  }

  updateProgress(objectiveId: string, progress: number): boolean {
    const objective = this.objectives.find(obj => obj.id === objectiveId)
    if (!objective || objective.status !== 'active') return false

    objective.progress.current = Math.min(progress, objective.progress.total)
    
    if (objective.progress.current >= objective.progress.total) {
      this.completeObjective(objectiveId)
      return true
    }
    
    return false
  }

  visitPlanet(planetName: string): boolean {
    this.visitedPlanets.add(planetName.toLowerCase())
    
    // Update exploration objectives based on unique planet visits
    const exploration001 = this.objectives.find(obj => obj.id === 'exploration-001')
    const exploration002 = this.objectives.find(obj => obj.id === 'exploration-002')
    
    // Check if exploration-001 should be unlocked
    if (exploration001 && exploration001.status === 'locked') {
      const tutorial002 = this.objectives.find(obj => obj.id === 'tutorial-002')
      if (tutorial002 && tutorial002.status === 'completed') {
        exploration001.status = 'active'
      }
    }
    
    // Check if exploration-002 should be unlocked
    if (exploration002 && exploration002.status === 'locked') {
      const exploration001Completed = exploration001 && exploration001.status === 'completed'
      if (exploration001Completed) {
        exploration002.status = 'active'
      }
    }
    
    // Update progress for active objectives
    if (exploration001 && exploration001.status === 'active') {
      exploration001.progress.current = Math.min(this.visitedPlanets.size, 3)
      if (exploration001.progress.current >= 3) {
        this.completeObjective('exploration-001')
      }
    }
    
    if (exploration002 && exploration002.status === 'active') {
      exploration002.progress.current = Math.min(this.visitedPlanets.size, 8)
      if (exploration002.progress.current >= 8) {
        this.completeObjective('exploration-002')
      }
    }
    
    return true
  }

  completeObjective(objectiveId: string): boolean {
    const objective = this.objectives.find(obj => obj.id === objectiveId)
    if (!objective || objective.status !== 'active') return false

    objective.status = 'completed'
    this.completedObjectives.add(objectiveId)
    this.totalPoints += objective.rewards.points

    // Unlock next objectives
    if (objective.rewards.unlocks) {
      objective.rewards.unlocks.forEach(unlockId => {
        const unlockObjective = this.objectives.find(obj => obj.id === unlockId)
        if (unlockObjective && unlockObjective.status === 'locked') {
          unlockObjective.status = 'available'
        }
      })
    }

    // Set next active objective
    this.setNextActiveObjective()
    
    return true
  }

  private setNextActiveObjective(): void {
    // Find the highest priority available objective
    const availableObjectives = this.objectives.filter(obj => obj.status === 'available')
    
    if (availableObjectives.length === 0) {
      this.currentObjective = null
      return
    }

    // Sort by priority and then by ID for consistency
    const sortedObjectives = availableObjectives.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return a.id.localeCompare(b.id)
    })

    this.currentObjective = sortedObjectives[0]
    this.currentObjective.status = 'active'
  }

  getObjectiveById(id: string): Objective | undefined {
    return this.objectives.find(obj => obj.id === id)
  }

  getAllObjectives(): Objective[] {
    return [...this.objectives]
  }

  reset(): void {
    this.objectives = [...objectives]
    this.completedObjectives.clear()
    this.currentObjective = this.objectives.find(obj => obj.status === 'active') || null
    this.totalPoints = 0
    this.visitedPlanets.clear()
  }
}

// Global instance
export const objectiveManager = new ObjectiveManager()
