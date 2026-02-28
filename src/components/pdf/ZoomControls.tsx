import { ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { useEditor } from '../../state/EditorContext'
import { IconButton } from '../ui/IconButton'

export function ZoomControls() {
  const { state, dispatch } = useEditor()

  const zoomIn = () => dispatch({ type: 'SET_ZOOM', payload: state.zoom + 0.15 })
  const zoomOut = () => dispatch({ type: 'SET_ZOOM', payload: state.zoom - 0.15 })
  const zoomFit = () => dispatch({ type: 'SET_ZOOM', payload: 1 })

  return (
    <div className="flex items-center gap-1">
      <IconButton size="sm" onClick={zoomOut} tooltip="Zoom Out">
        <ZoomOut size={15} />
      </IconButton>
      <span className="text-xs text-slate-500 font-medium w-12 text-center tabular-nums">
        {Math.round(state.zoom * 100)}%
      </span>
      <IconButton size="sm" onClick={zoomIn} tooltip="Zoom In">
        <ZoomIn size={15} />
      </IconButton>
      <IconButton size="sm" onClick={zoomFit} tooltip="Fit to Width">
        <Maximize size={15} />
      </IconButton>
    </div>
  )
}
