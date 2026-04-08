import { useState, useEffect } from 'react'
import colombiaLocations from '../data/colombia-locations.json'
import { inputStyle } from '../shared'

export function LocationSelect({
  value,
  onChange,
  dark,
  hasError,
}: {
  value: string
  onChange: (val: string) => void
  dark: boolean
  hasError: boolean
}) {
  const departamentos = colombiaLocations.departamentos
  const municipios    = colombiaLocations.municipios

  const [deptoCode, setDeptoCode] = useState<string>('')

  useEffect(() => {
    if (value) {
      const parts = value.split(', ')
      if (parts.length === 2) {
        const deptoName = parts[1]
        const found = departamentos.find(d => d.nombre === deptoName)
        if (found) setDeptoCode(found.codigo)
      }
    }
  }, [])

  const municipiosFiltrados = deptoCode
    ? municipios.filter(m => m.departamento === deptoCode)
    : []

  const currentMunicipio = value ? value.split(', ')[0] : ''

  const handleDepto = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setDeptoCode(code)
    onChange('')
  }

  const handleMunicipio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mun = e.target.value
    if (!mun) { onChange(''); return }
    const depto = departamentos.find(d => d.codigo === deptoCode)
    onChange(depto ? `${mun}, ${depto.nombre}` : mun)
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle(dark, hasError),
    cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <select value={deptoCode} onChange={handleDepto} style={selectStyle}>
        <option value="">— Departamento —</option>
        {departamentos.map(d => (
          <option key={d.codigo} value={d.codigo}>{d.nombre}</option>
        ))}
      </select>
      <select
        value={currentMunicipio}
        onChange={handleMunicipio}
        style={selectStyle}
        disabled={!deptoCode}
      >
        <option value="">— Municipio —</option>
        {municipiosFiltrados.map(m => (
          <option key={m.codigo} value={m.nombre}>{m.nombre}</option>
        ))}
      </select>
    </div>
  )
}
