import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VisualSettings {
  textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  particles: boolean;
  dynamicLighting: boolean;
  spaceAmbience: boolean;
  enhancedShadows: boolean;
  atmosphericEffects: boolean;
}

export interface PerformanceSettings {
  renderDistance: number;
  smoothRotation: boolean;
  fastTravel: boolean;
  highFPS: boolean;
  optimizedRendering: boolean;
}

export interface FeatureSettings {
  planetComparison: boolean;
  advancedAnnotations: boolean;
  realTimeData: boolean;
  exportData: boolean;
  customThemes: boolean;
  voiceCommands: boolean;
  multiLanguage: boolean;
  advancedSearch: boolean;
}

export interface SettingsState {
  visual: VisualSettings;
  performance: PerformanceSettings;
  features: FeatureSettings;
  
  // Actions
  updateVisualSettings: (settings: Partial<VisualSettings>) => void;
  updatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  updateFeatureSettings: (settings: Partial<FeatureSettings>) => void;
  applyShopItemEffect: (itemId: string, effect: any) => void;
  resetSettings: () => void;
}

const defaultVisualSettings: VisualSettings = {
  textureQuality: 'medium',
  particles: false,
  dynamicLighting: false,
  spaceAmbience: false,
  enhancedShadows: false,
  atmosphericEffects: false,
};

const defaultPerformanceSettings: PerformanceSettings = {
  renderDistance: 1.0,
  smoothRotation: false,
  fastTravel: false,
  highFPS: false,
  optimizedRendering: false,
};

const defaultFeatureSettings: FeatureSettings = {
  planetComparison: false,
  advancedAnnotations: false,
  realTimeData: false,
  exportData: false,
  customThemes: false,
  voiceCommands: false,
  multiLanguage: false,
  advancedSearch: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      visual: defaultVisualSettings,
      performance: defaultPerformanceSettings,
      features: defaultFeatureSettings,

      updateVisualSettings: (settings) =>
        set((state) => ({
          visual: { ...state.visual, ...settings }
        })),

      updatePerformanceSettings: (settings) =>
        set((state) => ({
          performance: { ...state.performance, ...settings }
        })),

      updateFeatureSettings: (settings) =>
        set((state) => ({
          features: { ...state.features, ...settings }
        })),

      applyShopItemEffect: (itemId: string, effect: any) => {
        const { type, value } = effect;
        
        switch (type) {
          case 'visual':
            get().updateVisualSettings(value);
            break;
          case 'performance':
            get().updatePerformanceSettings(value);
            break;
          case 'feature':
            get().updateFeatureSettings(value);
            break;
        }
      },

      resetSettings: () =>
        set({
          visual: defaultVisualSettings,
          performance: defaultPerformanceSettings,
          features: defaultFeatureSettings,
        }),
    }),
    {
      name: 'cosmoscope-settings',
      version: 1,
    }
  )
);
