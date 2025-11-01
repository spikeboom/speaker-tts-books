interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInput({ value, onChange, disabled = false }: TextInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Digite ou cole o texto que deseja ouvir..."
      className="w-full h-64 p-4 border-2 rounded-lg focus:outline-none resize-none transition-colors"
      style={{
        backgroundColor: disabled ? 'var(--gray-100)' : 'var(--input-bg)',
        borderColor: 'var(--input-border)',
        color: 'var(--input-text)',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    />
  );
}
