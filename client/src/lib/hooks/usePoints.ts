import { usePointsStore, POINTS_CONFIG } from '../../store/pointsStore';

export const usePoints = () => {
  const { addPoints, spendPoints: spendPointsStore, totalPoints } = usePointsStore();

  const awardPoints = (type: keyof typeof POINTS_CONFIG, x?: number, y?: number) => {
    const points = POINTS_CONFIG[type];
    const reason = getReasonText(type);
    addPoints(points, reason, x, y);
  };

  const awardCustomPoints = (points: number, reason: string, x?: number, y?: number) => {
    addPoints(points, reason, x, y);
  };

  const spendPoints = (points: number, reason: string) => {
    return spendPointsStore(points, reason);
  };

  return {
    awardPoints,
    awardCustomPoints,
    spendPoints,
    totalPoints
  };
};

const getReasonText = (type: keyof typeof POINTS_CONFIG): string => {
  const reasonMap = {
    ANNOTATION_CREATE: 'Annotation Created',
    ANNOTATION_EDIT: 'Annotation Edited',
    ANNOTATION_DELETE: 'Annotation Deleted',
    PLANET_CLICK: 'Planet Explored',
    PLANET_EXPLORE: 'Deep Exploration',
    DISCOVERY: 'New Discovery!',
    ACHIEVEMENT: 'Achievement Unlocked!',
    BONUS: 'Bonus Points!'
  };
  
  return reasonMap[type] || 'Points Earned';
};
