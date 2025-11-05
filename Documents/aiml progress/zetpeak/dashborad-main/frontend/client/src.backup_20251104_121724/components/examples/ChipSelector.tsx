import { useState } from 'react';
import ChipSelector from '../ChipSelector';

export default function ChipSelectorExample() {
  const [selected, setSelected] = useState<string[]>(['HR', 'Healthcare']);

  const options = [
    'HR',
    'Sales',
    'Marketing',
    'Customer support',
    'Information Technology',
    'Healthcare',
    'Education',
    'Finance',
  ];

  return (
    <div className="w-full max-w-2xl p-6 bg-background">
      <ChipSelector
        options={options}
        selected={selected}
        onChange={setSelected}
        label="Which industry best describes your business?"
      />
    </div>
  );
}
