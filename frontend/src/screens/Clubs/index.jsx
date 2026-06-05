import { useState } from 'react';
import { SearchX } from 'lucide-react';
import { useClubs } from '../../hooks/useClubs.js';
import { useToast } from '../../context/ToastContext.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import ClubCard from '../../components/clubs/ClubCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { clubCategories } from '../../data/fixtures.js';

// Image 6 — Browse Clubs.
export default function Clubs() {
  const { clubs } = useClubs();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const handleApply = (id) => {
    const club = clubs.find((c) => c.id === id);
    toast(`Application submitted to ${club?.name ?? 'the club'}`);
  };

  const filtered = clubs.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || c.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="container page">
      <div className="page-head">
        <div className="page-head__titles">
          <h1 className="page-title">Browse Clubs</h1>
          <p className="page-subtitle">Discover clubs and student organizations at Dartmouth</p>
        </div>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        categories={clubCategories}
        placeholder="Search clubs..."
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No clubs found"
          hint="Try a different search term or category filter."
        />
      ) : (
        <div className="card-grid">
          {filtered.map((club) => (
            <ClubCard key={club.id} club={club} onApply={handleApply} />
          ))}
        </div>
      )}
    </div>
  );
}
