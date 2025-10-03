export interface ShopItem {
  id: string
  name: string
  description: string
  category: 'visual' | 'performance' | 'features' | 'cosmetics'
  price: number
  unlocked: boolean
  purchased: boolean
  effect?: {
    type: 'visual' | 'performance' | 'feature'
    value: any
  }
  requirements?: {
    level?: number
    objectives?: string[]
  }
}

export const shopItems: ShopItem[] = [
  // Visual Upgrades
  {
    id: 'enhanced-graphics',
    name: 'Enhanced Graphics',
    description: 'Improve planet textures and visual quality',
    category: 'visual',
    price: 100,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'visual',
      value: { textureQuality: 'high' }
    }
  },
  {
    id: 'particle-effects',
    name: 'Particle Effects',
    description: 'Add atmospheric particles and visual effects',
    category: 'visual',
    price: 150,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'visual',
      value: { particles: true }
    }
  },
  {
    id: 'dynamic-lighting',
    name: 'Dynamic Lighting',
    description: 'Enhanced lighting and shadows for planets',
    category: 'visual',
    price: 200,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'visual',
      value: { dynamicLighting: true }
    }
  },
  {
    id: 'space-ambience',
    name: 'Space Ambience',
    description: 'Add background stars and nebula effects',
    category: 'visual',
    price: 250,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'visual',
      value: { spaceAmbience: true }
    }
  },

  // Performance Upgrades
  {
    id: 'render-distance',
    name: 'Extended Render Distance',
    description: 'Increase planet detail at greater distances',
    category: 'performance',
    price: 300,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'performance',
      value: { renderDistance: 2.0 }
    }
  },
  {
    id: 'smooth-rotation',
    name: 'Smooth Rotation',
    description: 'Enable smooth planet rotation animations',
    category: 'performance',
    price: 180,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'performance',
      value: { smoothRotation: true }
    }
  },
  {
    id: 'fast-travel',
    name: 'Fast Travel',
    description: 'Instant planet transitions (no loading time)',
    category: 'performance',
    price: 400,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'performance',
      value: { fastTravel: true }
    }
  },

  // Features
  {
    id: 'planet-comparison',
    name: 'Planet Comparison',
    description: 'Compare multiple planets side by side',
    category: 'features',
    price: 350,
    unlocked: false,
    purchased: false,
    requirements: {
      level: 3,
      objectives: ['exploration-001']
    },
    effect: {
      type: 'feature',
      value: { planetComparison: true }
    }
  },
  {
    id: 'advanced-annotations',
    name: 'Advanced Annotations',
    description: 'Add measurement tools and advanced drawing features',
    category: 'features',
    price: 280,
    unlocked: false,
    purchased: false,
    requirements: {
      level: 2,
      objectives: ['discovery-001']
    },
    effect: {
      type: 'feature',
      value: { advancedAnnotations: true }
    }
  },
  {
    id: 'data-export',
    name: 'Data Export',
    description: 'Export planet data and annotations to files',
    category: 'features',
    price: 320,
    unlocked: false,
    purchased: false,
    requirements: {
      level: 4,
      objectives: ['achievement-001']
    },
    effect: {
      type: 'feature',
      value: { dataExport: true }
    }
  },
  {
    id: 'time-travel',
    name: 'Time Travel',
    description: 'View planets at different time periods',
    category: 'features',
    price: 500,
    unlocked: false,
    purchased: false,
    requirements: {
      level: 5,
      objectives: ['exploration-002']
    },
    effect: {
      type: 'feature',
      value: { timeTravel: true }
    }
  },

  // Cosmetics
  {
    id: 'custom-theme',
    name: 'Custom Theme',
    description: 'Unlock additional color themes and UI styles',
    category: 'cosmetics',
    price: 120,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'visual',
      value: { customThemes: true }
    }
  },
  {
    id: 'achievement-badges',
    name: 'Achievement Badges',
    description: 'Display achievement badges on your profile',
    category: 'cosmetics',
    price: 80,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'visual',
      value: { achievementBadges: true }
    }
  },
  {
    id: 'custom-cursor',
    name: 'Custom Cursor',
    description: 'Space-themed cursor designs',
    category: 'cosmetics',
    price: 60,
    unlocked: true,
    purchased: false,
    effect: {
      type: 'visual',
      value: { customCursor: true }
    }
  }
]

export class ShopManager {
  private items: ShopItem[]
  private purchasedItems: Set<string>
  private activeEffects: Map<string, any>

  constructor() {
    this.items = [...shopItems]
    this.purchasedItems = new Set()
    this.activeEffects = new Map()
    this.loadPurchases()
    this.applyAllPurchasedEffects()
  }

  getItemsByCategory(category: string): ShopItem[] {
    return this.items.filter(item => item.category === category)
  }

  getAvailableItems(): ShopItem[] {
    return this.items.filter(item => item.unlocked && !item.purchased)
  }

  getPurchasedItems(): ShopItem[] {
    return this.items.filter(item => item.purchased)
  }

  canPurchase(itemId: string, currentPoints: number, currentLevel: number, completedObjectives: string[]): boolean {
    const item = this.items.find(i => i.id === itemId)
    if (!item || item.purchased) return false

    // Ensure we have valid values
    const points = currentPoints || 0
    const level = currentLevel || 1
    const objectives = completedObjectives || []

    // Check if item is unlocked
    if (!item.unlocked) {
      if (item.requirements) {
        if (item.requirements.level && level < item.requirements.level) return false
        if (item.requirements.objectives) {
          const hasAllObjectives = item.requirements.objectives.every(objId => 
            objectives.includes(objId)
          )
          if (!hasAllObjectives) return false
        }
      } else {
        return false
      }
    }

    return points >= item.price
  }

  purchaseItem(itemId: string, currentPoints: number, currentLevel: number, completedObjectives: string[]): boolean {
    if (!this.canPurchase(itemId, currentPoints, currentLevel, completedObjectives)) {
      return false
    }

    const item = this.items.find(i => i.id === itemId)
    if (!item) return false

    item.purchased = true
    this.purchasedItems.add(itemId)
    
    // Apply effect immediately
    if (item.effect) {
      this.applyEffect(itemId, item.effect)
    }

    this.savePurchases()
    return true
  }

  getActiveEffects(): Map<string, any> {
    return this.activeEffects
  }

  private applyEffect(itemId: string, effect: { type: string; value: any }): void {
    this.activeEffects.set(itemId, effect.value)
    
    // Apply effect to settings store
    if (typeof window !== 'undefined') {
      // Dynamic import to avoid circular dependencies
      import('../store/settingsStore').then(({ useSettingsStore }) => {
        const { applyShopItemEffect } = useSettingsStore.getState()
        applyShopItemEffect(itemId, effect)
      })
    }
  }

  private applyAllPurchasedEffects(): void {
    this.items
      .filter(item => item.purchased && item.effect)
      .forEach(item => {
        this.applyEffect(item.id, item.effect!)
      })
  }

  getTotalSpent(): number {
    return this.items
      .filter(item => item.purchased)
      .reduce((total, item) => total + item.price, 0)
  }

  unlockItem(itemId: string): void {
    const item = this.items.find(i => i.id === itemId)
    if (item) {
      item.unlocked = true
    }
  }

  checkUnlocks(currentLevel: number, completedObjectives: string[]): void {
    const level = currentLevel || 1
    const objectives = completedObjectives || []
    
    this.items.forEach(item => {
      if (!item.unlocked && item.requirements) {
        let shouldUnlock = true

        if (item.requirements.level && level < item.requirements.level) {
          shouldUnlock = false
        }

        if (item.requirements.objectives) {
          const hasAllObjectives = item.requirements.objectives.every(objId => 
            objectives.includes(objId)
          )
          if (!hasAllObjectives) {
            shouldUnlock = false
          }
        }

        if (shouldUnlock) {
          item.unlocked = true
        }
      }
    })
  }

  private savePurchases(): void {
    const purchases = Array.from(this.purchasedItems)
    localStorage.setItem('cosmoscope-shop-purchases', JSON.stringify(purchases))
  }

  private loadPurchases(): void {
    try {
      const saved = localStorage.getItem('cosmoscope-shop-purchases')
      if (saved) {
        const purchases = JSON.parse(saved)
        purchases.forEach((itemId: string) => {
          const item = this.items.find(i => i.id === itemId)
          if (item) {
            item.purchased = true
            this.purchasedItems.add(itemId)
            if (item.effect) {
              this.activeEffects.set(itemId, item.effect.value)
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to load shop purchases:', error)
    }
  }

  reset(): void {
    this.items = [...shopItems]
    this.purchasedItems.clear()
    this.activeEffects.clear()
    localStorage.removeItem('cosmoscope-shop-purchases')
  }
}

// Global instance
export const shopManager = new ShopManager()
