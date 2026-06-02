import { Search, ChevronDown } from 'lucide-react';

// search + category dropdown (Events & Clubs pages).
export default function SearchBar({
  value,
  onChange,
  category,
  onCategoryChange,
  categories = [],
  placeholder = 'Search...',
}) {
  return (
    <div className="search-bar">
      <div className="search-field">
        <Search />
        <input
          type="search"
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>
      <div className="search-select">
        <select
          value={category ?? ''}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ChevronDown />
      </div>
    </div>
  );
}
