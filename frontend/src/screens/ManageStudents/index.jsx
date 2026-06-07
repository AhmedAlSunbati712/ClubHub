import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, GraduationCap } from 'lucide-react';
import { useUsers } from '../../api/user.ts';
import { UserRole } from '../../types/user';
import StudentTable from '../../components/admin/StudentTable.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

// Admin "View All Students" — directory of every student account.
export default function ManageStudents() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data: students = [], isLoading, isError } = useUsers({ role: UserRole.STUDENT });

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.email.toLowerCase().includes(normalizedQuery),
    );
  }, [students, query]);

  return (
    <div className="container page">
      <div className="page-head">
        <div className="page-head__back">
          <button type="button" className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div className="page-head__titles">
            <h1 className="page-title">All Students</h1>
            <p className="page-subtitle">{students.length} students registered</p>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-field">
          <Search />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name or email…"
            aria-label="Search students by name or email"
          />
        </div>
      </div>

      {isLoading ? (
        <EmptyState icon={GraduationCap} title="Loading students" hint="Fetching the student directory." />
      ) : isError ? (
        <EmptyState icon={GraduationCap} title="Unable to load students" hint="Try refreshing the page." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          hint={query ? 'Try a different search.' : 'No student accounts yet.'}
        />
      ) : (
        <StudentTable students={filtered} />
      )}
    </div>
  );
}
