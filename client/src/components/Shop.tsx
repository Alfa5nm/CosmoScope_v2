import React, { useState, useEffect } from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { usePoints } from '../lib/hooks/usePoints'
import { useObjectives } from '../lib/hooks/useObjectives'
import { shopManager, ShopItem } from '../lib/shopSystem'

interface ShopProps {
  isOpen: boolean
  onClose: () => void
}

const Shop: React.FC<ShopProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const { totalPoints, spendPoints } = usePoints()
  const { progress, getAllObjectives } = useObjectives()
  
  // Ensure we have valid values
  const points = totalPoints || 0
  const currentLevel = progress?.level || 1
  const [selectedCategory, setSelectedCategory] = useState<string>('visual')
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)

  const categories = [
    { id: 'visual', name: 'Visual', icon: '🎨' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'features', name: 'Features', icon: '🔧' },
    { id: 'cosmetics', name: 'Cosmetics', icon: '✨' }
  ]

  const items = shopManager.getItemsByCategory(selectedCategory)
  const completedObjectives = getAllObjectives()
    .filter(obj => obj.status === 'completed')
    .map(obj => obj.id)

  useEffect(() => {
    // Check for new unlocks when shop opens
    if (isOpen) {
      shopManager.checkUnlocks(currentLevel, completedObjectives)
    }
  }, [isOpen, currentLevel, completedObjectives])

  // Refresh points when shop opens to ensure we have the latest values
  useEffect(() => {
    if (isOpen) {
      // Force a re-render by updating a dummy state or calling a refresh function
      // The points should automatically update via the usePoints hook
    }
  }, [isOpen])

  const handlePurchase = (item: ShopItem) => {
    if (shopManager.canPurchase(item.id, points, currentLevel, completedObjectives)) {
      if (spendPoints(item.price, `Purchased ${item.name}`)) {
        if (shopManager.purchaseItem(item.id, points, currentLevel, completedObjectives)) {
          setPurchaseMessage(`✅ Successfully purchased ${item.name} for ${item.price.toLocaleString()} points!`)
          playSound('click')
          setTimeout(() => setPurchaseMessage(null), 4000)
        } else {
          setPurchaseMessage(`❌ Purchase failed for ${item.name}`)
          playSound('click')
          setTimeout(() => setPurchaseMessage(null), 3000)
        }
      } else {
        setPurchaseMessage(`❌ Insufficient points to purchase ${item.name}`)
        playSound('click')
        setTimeout(() => setPurchaseMessage(null), 3000)
      }
    } else {
      const reasons = []
      if (!item.unlocked) reasons.push('item is locked')
      if (points < item.price) reasons.push(`need ${(item.price - points).toLocaleString()} more points`)
      if (currentLevel < (item.requirements?.level || 1)) reasons.push(`need level ${item.requirements?.level}`)
      
      setPurchaseMessage(`❌ Cannot purchase ${item.name}: ${reasons.join(', ')}`)
      playSound('click')
      setTimeout(() => setPurchaseMessage(null), 4000)
    }
  }

  const getItemStatus = (item: ShopItem) => {
    if (item.purchased) return 'purchased'
    if (!item.unlocked) return 'locked'
    if (points >= item.price) return 'affordable'
    return 'expensive'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'purchased': return theme.colors.success
      case 'locked': return theme.colors.textSecondary
      case 'affordable': return theme.colors.primary
      case 'expensive': return theme.colors.warning
      default: return theme.colors.text
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'purchased': return 'Purchased'
      case 'locked': return 'Locked'
      case 'affordable': return 'Buy'
      case 'expensive': return 'Need more points'
      default: return ''
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        backgroundColor: theme.colors.background,
        borderRadius: '16px',
        padding: theme.spacing.xl,
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        border: `1px solid ${theme.colors.border}`
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          borderBottom: `1px solid ${theme.colors.border}`
        }}>
          <h2 style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.xxl,
            fontWeight: theme.typography.fontWeight.bold,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm
          }}>
            🛒 CosmoScope Shop
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.md
          }}>
            <div style={{
              color: theme.colors.primary,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm
            }}>
              ⭐ {points.toLocaleString()} points
            </div>
            <button
              onClick={() => {
                onClose()
                playSound('click')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text,
                fontSize: '24px',
                cursor: 'pointer',
                padding: theme.spacing.sm,
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary
                e.currentTarget.style.color = theme.colors.primary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.text
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Purchase Message */}
        {purchaseMessage && (
          <div style={{
            backgroundColor: purchaseMessage.includes('✅') ? theme.colors.success + '20' : theme.colors.warning + '20',
            color: purchaseMessage.includes('✅') ? theme.colors.success : theme.colors.warning,
            padding: theme.spacing.sm,
            borderRadius: '8px',
            marginBottom: theme.spacing.md,
            textAlign: 'center',
            fontWeight: theme.typography.fontWeight.bold
          }}>
            {purchaseMessage}
          </div>
        )}

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
          overflowX: 'auto',
          paddingBottom: theme.spacing.sm
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id)
                playSound('click')
              }}
              style={{
                background: selectedCategory === category.id 
                  ? theme.colors.primary 
                  : theme.colors.backgroundSecondary,
                color: selectedCategory === category.id 
                  ? '#000' 
                  : theme.colors.text,
                border: `1px solid ${selectedCategory === category.id 
                  ? theme.colors.primary 
                  : theme.colors.border}`,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.bold,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = theme.colors.primary + '20'
                  e.currentTarget.style.borderColor = theme.colors.primary
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = theme.colors.backgroundSecondary
                  e.currentTarget.style.borderColor = theme.colors.border
                }
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: theme.spacing.md,
          paddingRight: theme.spacing.sm
        }}>
          {items.map(item => {
            const status = getItemStatus(item)
            const statusColor = getStatusColor(status)
            const statusText = getStatusText(status)
            const canPurchase = shopManager.canPurchase(item.id, points, currentLevel, completedObjectives)

            return (
              <div
                key={item.id}
                className={`shop-item ${status === 'purchased' ? 'purchased' : ''} ${status === 'locked' ? 'locked' : 'unlocked'}`}
                style={{
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderRadius: '12px',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.sm,
                  opacity: status === 'locked' ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (status !== 'locked') {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <h3 style={{
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    margin: 0
                  }}>
                    {item.name}
                  </h3>
                  <div style={{
                    color: statusColor,
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold
                  }}>
                    ⭐ {item.price.toLocaleString()}
                  </div>
                </div>

                <p style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  {item.description}
                </p>

                {item.requirements && (
                  <div style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSecondary,
                    backgroundColor: theme.colors.background + '80',
                    padding: theme.spacing.xs,
                    borderRadius: '6px'
                  }}>
                    {item.requirements.level && (
                      <div>Level {item.requirements.level} required</div>
                    )}
                    {item.requirements.objectives && (
                      <div>Complete objectives: {item.requirements.objectives.join(', ')}</div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={!canPurchase || item.purchased}
                  style={{
                    background: item.purchased 
                      ? theme.colors.success 
                      : canPurchase 
                        ? theme.colors.primary 
                        : theme.colors.backgroundSecondary,
                    color: item.purchased || canPurchase ? '#000' : theme.colors.textSecondary,
                    border: `1px solid ${item.purchased 
                      ? theme.colors.success 
                      : canPurchase 
                        ? theme.colors.primary 
                        : theme.colors.border}`,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: '8px',
                    cursor: canPurchase && !item.purchased ? 'pointer' : 'not-allowed',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.bold,
                    transition: 'all 0.2s ease',
                    opacity: canPurchase && !item.purchased ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (canPurchase && !item.purchased) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {statusText}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textSecondary
        }}>
          <div>
            Total spent: ⭐ {shopManager.getTotalSpent().toLocaleString()}
          </div>
          <div>
            Purchased: {shopManager.getPurchasedItems().length} items
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
