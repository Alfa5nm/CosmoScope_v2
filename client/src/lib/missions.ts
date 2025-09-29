export interface Mission {
  id: string
  title: string
  description: string
  type: 'main' | 'side'
  status: 'locked' | 'available' | 'active' | 'completed'
  requirements: string[]
  rewards: {
    points: number
    unlocks?: string[]
  }
  steps: MissionStep[]
  planet?: string
  coordinates?: {
    lat: number
    lon: number
  }
  date?: string
}

export interface MissionStep {
  id: string
  title: string
  description: string
  type: 'travel' | 'observe' | 'label' | 'discover' | 'compare'
  target?: {
    planet?: string
    coordinates?: { lat: number; lon: number }
    date?: string
    layer?: string
  }
  completed: boolean
}

export const missions: Mission[] = [
  {
    id: 'main-001',
    title: 'The Time Traveler\'s Journey',
    description: 'Begin your journey as a time-traveling astronaut investigating mysterious signals from Earth.',
    type: 'main',
    status: 'active',
    requirements: [],
    rewards: { points: 100 },
    steps: [
      {
        id: 'step-001',
        title: 'Launch Sequence',
        description: 'Start your journey by exploring the solar system',
        type: 'travel',
        target: { planet: 'earth' },
        completed: false
      },
      {
        id: 'step-002',
        title: 'Earth Observation',
        description: 'Observe Earth from space and identify key locations',
        type: 'observe',
        target: { planet: 'earth' },
        completed: false
      },
      {
        id: 'step-003',
        title: 'The Apollo Trail',
        description: 'Travel to the Moon and visit the Apollo 11 landing site',
        type: 'travel',
        target: { planet: 'moon', coordinates: { lat: 0.6741, lon: 23.4730 } },
        completed: false
      }
    ]
  },
  {
    id: 'side-001',
    title: 'Crater Explorer',
    description: 'Discover and label interesting craters on the Moon',
    type: 'side',
    status: 'locked',
    requirements: ['main-001'],
    rewards: { points: 50, unlocks: ['side-002'] },
    steps: [
      {
        id: 'side-001-step-001',
        title: 'Find a Crater',
        description: 'Locate and label at least 3 craters on the Moon',
        type: 'label',
        target: { planet: 'moon' },
        completed: false
      }
    ],
    planet: 'moon'
  },
  {
    id: 'side-002',
    title: 'Mars Reconnaissance',
    description: 'Explore the red planet and its unique features',
    type: 'side',
    status: 'locked',
    requirements: ['side-001'],
    rewards: { points: 75 },
    steps: [
      {
        id: 'side-002-step-001',
        title: 'Mars Landing',
        description: 'Travel to Mars and explore its surface',
        type: 'travel',
        target: { planet: 'mars' },
        completed: false
      },
      {
        id: 'side-002-step-002',
        title: 'Olympus Mons',
        description: 'Visit the largest volcano in the solar system',
        type: 'travel',
        target: { planet: 'mars', coordinates: { lat: 18.65, lon: 226.2 } },
        completed: false
      }
    ],
    planet: 'mars'
  },
  {
    id: 'side-003',
    title: 'Temporal Anomaly',
    description: 'Investigate strange temporal readings from Earth in 2023',
    type: 'side',
    status: 'locked',
    requirements: ['main-001'],
    rewards: { points: 100 },
    steps: [
      {
        id: 'side-003-step-001',
        title: 'Time Jump',
        description: 'Travel to Earth in 2023 and investigate the anomaly',
        type: 'travel',
        target: { planet: 'earth', date: '2023-06-15' },
        completed: false
      },
      {
        id: 'side-003-step-002',
        title: 'Anomaly Detection',
        description: 'Use thermal imaging to identify the source of the anomaly',
        type: 'observe',
        target: { planet: 'earth', layer: 'thermal', date: '2023-06-15' },
        completed: false
      }
    ],
    planet: 'earth',
    date: '2023-06-15'
  }
]

export const getAvailableMissions = (completedMissions: string[]): Mission[] => {
  return missions.filter(mission => {
    if (mission.status === 'completed') return false
    if (mission.status === 'active') return true
    
    // Check if requirements are met
    return mission.requirements.every(req => completedMissions.includes(req))
  })
}

export const getMissionById = (id: string): Mission | undefined => {
  return missions.find(mission => mission.id === id)
}

export const updateMissionStatus = (missionId: string, status: Mission['status']): Mission | null => {
  const mission = getMissionById(missionId)
  if (mission) {
    mission.status = status
    return mission
  }
  return null
}

export const completeMissionStep = (missionId: string, stepId: string): boolean => {
  const mission = getMissionById(missionId)
  if (mission) {
    const step = mission.steps.find(s => s.id === stepId)
    if (step) {
      step.completed = true
      
      // Check if all steps are completed
      const allCompleted = mission.steps.every(s => s.completed)
      if (allCompleted) {
        mission.status = 'completed'
      }
      
      return true
    }
  }
  return false
}

export const getCurrentObjective = (_gameState: any): string => {
  const activeMissions = missions.filter(m => m.status === 'active')
  if (activeMissions.length === 0) {
    return "Explore the cosmos and discover its secrets"
  }
  
  const mission = activeMissions[0]
  const currentStep = mission.steps.find(s => !s.completed)
  
  if (currentStep) {
    return currentStep.description
  }
  
  return mission.description
}
