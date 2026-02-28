const PRESET_COLORS = [
  '#000000', '#1e293b', '#334155', '#6b7280',
  '#dc2626', '#ea580c', '#d97706', '#16a34a',
  '#2563eb', '#7c3aed', '#db2777', '#0891b2',
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-6 h-6 rounded-md border-2 transition-all ${
            value === color ? 'border-primary-500 scale-110' : 'border-slate-200 hover:border-slate-300'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
      <label className="w-6 h-6 rounded-md border-2 border-dashed border-slate-300 cursor-pointer overflow-hidden relative hover:border-slate-400 transition-colors">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">+</span>
      </label>
    </div>
  )
}
