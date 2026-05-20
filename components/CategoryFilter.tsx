'use client';

interface Props {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: Props) {
  const all = ['All', ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            active === cat
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
