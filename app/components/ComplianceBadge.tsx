'use client';

interface ComplianceBadgeProps {
  siren?: string | null;
  vat_number?: string | null;
}

export function ComplianceBadge({ siren, vat_number }: ComplianceBadgeProps) {
  const isCompliant = !!(siren || vat_number);

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
        isCompliant
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-red-100 text-red-800 border border-red-300'
      }`}
    >
      <span
        className={`mr-2 h-2 w-2 rounded-full ${
          isCompliant ? 'bg-green-600' : 'bg-red-600'
        }`}
      />
      {isCompliant ? 'Conforme 2026' : 'Incomplet'}
    </div>
  );
}
