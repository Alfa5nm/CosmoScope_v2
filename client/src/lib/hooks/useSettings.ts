import { useSettingsStore } from '../../store/settingsStore';

export const useSettings = () => {
  const {
    visual,
    performance,
    features,
    updateVisualSettings,
    updatePerformanceSettings,
    updateFeatureSettings,
    applyShopItemEffect,
    resetSettings
  } = useSettingsStore();

  return {
    visual,
    performance,
    features,
    updateVisualSettings,
    updatePerformanceSettings,
    updateFeatureSettings,
    applyShopItemEffect,
    resetSettings
  };
};
