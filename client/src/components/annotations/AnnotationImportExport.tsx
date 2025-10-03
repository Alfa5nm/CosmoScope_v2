import React, { useRef, useState } from 'react'
import { useAnnotationStore } from '../../store/annotationStore'
import { useTheme } from '../../lib/ui/theme'
import { useAudio } from '../../lib/audio/AudioContext'

interface AnnotationImportExportProps {
  planet: 'earth' | 'mars' | 'moon'
  isOpen: boolean
  onClose: () => void
}

const AnnotationImportExport: React.FC<AnnotationImportExportProps> = ({ planet, isOpen, onClose }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  
  const {
    annotations,
    exportAnnotations,
    importAnnotations,
    getAnnotationsByPlanet
  } = useAnnotationStore()

  const planetAnnotations = getAnnotationsByPlanet(planet)

  const handleExport = () => {
    try {
      const data = exportAnnotations()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cosmoscope-annotations-${planet}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      playSound('click')
      setImportStatus('Export successful!')
      setTimeout(() => setImportStatus(null), 3000)
    } catch (error) {
      setImportStatus('Export failed!')
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
    playSound('click')
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        importAnnotations(content)
        setImportStatus(`Import successful! Added annotations.`)
        playSound('click')
        setTimeout(() => setImportStatus(null), 3000)
      } catch (error) {
        setImportStatus('Import failed! Invalid file format.')
        setTimeout(() => setImportStatus(null), 3000)
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleExportPlanetOnly = () => {
    try {
      const planetData = {
        annotations: planetAnnotations,
        planet,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
      
      const data = JSON.stringify(planetData, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cosmoscope-${planet}-annotations-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      playSound('click')
      setImportStatus(`Exported ${planetAnnotations.length} ${planet} annotations!`)
      setTimeout(() => setImportStatus(null), 3000)
    } catch (error) {
      setImportStatus('Export failed!')
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: theme.colors.backgroundSecondary,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '12px',
        padding: theme.spacing.xl,
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.lg
        }}>
          <h2 style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.lg,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Import / Export Annotations
          </h2>
          <button
            onClick={() => {
              onClose()
              playSound('click')
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.text,
              fontSize: '24px',
              cursor: 'pointer',
              padding: theme.spacing.xs
            }}
          >
            ✕
          </button>
        </div>

        {/* Status message */}
        {importStatus && (
          <div style={{
            background: importStatus.includes('failed') 
              ? 'rgba(255, 0, 0, 0.2)' 
              : 'rgba(0, 255, 0, 0.2)',
            border: `1px solid ${importStatus.includes('failed') ? '#ff0000' : '#00ff00'}`,
            color: theme.colors.text,
            padding: theme.spacing.md,
            borderRadius: '4px',
            marginBottom: theme.spacing.lg,
            textAlign: 'center'
          }}>
            {importStatus}
          </div>
        )}

        {/* Stats */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: theme.spacing.md,
          borderRadius: '8px',
          marginBottom: theme.spacing.lg
        }}>
          <div style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.sm,
            marginBottom: theme.spacing.sm
          }}>
            📊 Current Statistics:
          </div>
          <div style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: theme.spacing.sm
          }}>
            <div>🌍 {planet}: {planetAnnotations.length}</div>
            <div>🌌 Total: {annotations.length}</div>
          </div>
        </div>

        {/* Export section */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <h3 style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md,
            margin: `0 0 ${theme.spacing.md} 0`
          }}>
            📤 Export Annotations
          </h3>
          
          <div style={{
            display: 'flex',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.sm
          }}>
            <button
              onClick={handleExportPlanetOnly}
              disabled={planetAnnotations.length === 0}
              style={{
                background: planetAnnotations.length > 0 
                  ? 'rgba(0, 255, 0, 0.2)' 
                  : 'rgba(128, 128, 128, 0.2)',
                border: `1px solid ${planetAnnotations.length > 0 ? '#00ff00' : '#666'}`,
                color: planetAnnotations.length > 0 ? theme.colors.text : '#666',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: '4px',
                cursor: planetAnnotations.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: theme.typography.fontSize.sm,
                flex: 1
              }}
            >
              Export {planet} only ({planetAnnotations.length})
            </button>
            
            <button
              onClick={handleExport}
              disabled={annotations.length === 0}
              style={{
                background: annotations.length > 0 
                  ? 'rgba(0, 255, 0, 0.2)' 
                  : 'rgba(128, 128, 128, 0.2)',
                border: `1px solid ${annotations.length > 0 ? '#00ff00' : '#666'}`,
                color: annotations.length > 0 ? theme.colors.text : '#666',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: '4px',
                cursor: annotations.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: theme.typography.fontSize.sm,
                flex: 1
              }}
            >
              Export all ({annotations.length})
            </button>
          </div>
          
          <div style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.xs,
            lineHeight: 1.4
          }}>
            Exports annotations as JSON file that can be imported later or shared with others.
          </div>
        </div>

        {/* Import section */}
        <div>
          <h3 style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md,
            margin: `0 0 ${theme.spacing.md} 0`
          }}>
            📥 Import Annotations
          </h3>
          
          <button
            onClick={handleImportClick}
            style={{
              background: 'rgba(0, 123, 255, 0.2)',
              border: '1px solid #007bff',
              color: theme.colors.text,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              width: '100%',
              marginBottom: theme.spacing.sm
            }}
          >
            📁 Choose JSON file to import
          </button>
          
          <div style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.xs,
            lineHeight: 1.4
          }}>
            Import annotations from a previously exported JSON file. Imported annotations will be added to your existing ones.
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

export default AnnotationImportExport



