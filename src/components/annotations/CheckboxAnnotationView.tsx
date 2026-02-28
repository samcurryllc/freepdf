import type { CheckboxAnnotation } from '../../types'
import { useEditor } from '../../state/EditorContext'
import { Check } from 'lucide-react'

interface Props { annotation: CheckboxAnnotation }

export function CheckboxAnnotationView({ annotation }: Props) {
  const { dispatch } = useEditor()

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({
      type: 'UPDATE_ANNOTATION',
      payload: { id: annotation.id, changes: { checked: !annotation.checked } },
    })
  }

  return (
    <div className="w-full h-full flex items-center gap-2 select-none" onDoubleClick={toggle}>
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
          ${annotation.checked ? 'bg-primary-600 border-primary-600' : 'bg-white border-slate-300'}`}
      >
        {annotation.checked && <Check size={14} className="text-white" />}
      </div>
      {annotation.label && <span className="text-sm text-slate-700 truncate">{annotation.label}</span>}
    </div>
  )
}
