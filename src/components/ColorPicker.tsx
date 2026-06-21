const PRESET_COLORS = [
  '#4a5e90', '#8a7040', '#3d7a68',
  '#9a5870', '#625898', '#5a5f70',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: 24, height: 24,
            borderRadius: '50%',
            background: c,
            border: value === c ? '2px solid #fff' : '2px solid transparent',
            outline: value === c ? `2px solid ${c}` : 'none',
            padding: 0,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}
