'use client';

import { site } from '@/lib/content/site';

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = site.limits.maxQtyPerItem,
  label = 'Jumlah',
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Kurangi ${label.toLowerCase()}`}
      >
        −
      </button>
      <output aria-live="polite" aria-label={`${label}: ${value}`}>
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Tambah ${label.toLowerCase()}`}
      >
        +
      </button>
    </div>
  );
}
