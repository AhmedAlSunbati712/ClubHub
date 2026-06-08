import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.ts';
import { useClubs } from '../../api/clubs.ts';
import {
  CLUB_MEMBERSHIPS_KEY,
  useCreateMembership,
  useUserMemberships,
} from '../../api/membership.ts';
import { ROUTES } from '../../constants/routes.js';
import SearchBar from '../../components/common/SearchBar.jsx';
import ClubCard from '../../components/clubs/ClubCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { clubCategories } from '../../constants/clubCategories.js';

export default function Clubs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const {
    data: clubs,
    isLoading: isLoadingClubs,
    isError: isErrorClubs,
  } = useClubs({
    category: category || undefined,
  });
  const {
    data: userMemberships,
    isLoading: isLoadingUserMemberships,
  } = useUserMemberships(user?.id);
  const { mutate: createMembership } = useCreateMembership();

  const filteredClubs = useMemo(() => {
    return (clubs ?? []).filter((club) => {
      if (club.status !== 'Active') {
        return false;
      }

      if (!query) {
        return true;
      }

      const normalizedQuery = query.toLowerCase();
      return (
        club.name.toLowerCase().includes(normalizedQuery) ||
        club.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [clubs, query]);

  const membershipsByClubId = useMemo(() => {
    return Object.fromEntries(
      (userMemberships ?? []).map((membership) => [membership.clubId, membership]),
    );
  }, [userMemberships]);

  const clubIds = filteredClubs.map((club) => club.id);

  const membershipCountQueries = useQueries({
    queries: clubIds.map((clubId) => ({
      queryKey: [CLUB_MEMBERSHIPS_KEY, clubId],
      queryFn: async () => {
        const response = await api.get(`/api/clubs/${clubId}/memberships`);
        return (response.data ?? []).filter((membership) => membership.Status === 'Active').length;
      },
      enabled: clubIds.length > 0,
    })),
  });

  const memberCountsByClubId = useMemo(() => {
    return Object.fromEntries(
      membershipCountQueries.map((result, index) => [clubIds[index], result.data ?? 0]),
    );
  }, [clubIds, membershipCountQueries]);

  const clubsForDisplay = useMemo(() => {
    return filteredClubs.map((club) => ({
      ...club,
      viewerRole: membershipsByClubId[club.id]?.role ?? null,
      viewerStatus: membershipsByClubId[club.id]?.status ?? null,
      memberCount: memberCountsByClubId[club.id] ?? 0,
    }));
  }, [filteredClubs, membershipsByClubId, memberCountsByClubId]);

  const isLoadingMembershipCounts = membershipCountQueries.some((result) => result.isLoading);
  const isErrorMembershipCounts = membershipCountQueries.some((result) => result.isError);

  const handleApply = (id) => {
    const club = clubsForDisplay.find((candidate) => candidate.id === id);
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    createMembership(id, {
      onSuccess: () => {
        toast.success(`Application submitted to ${club?.name ?? 'the club'}`);
      },
      onError: (error) => {
        const message =
          error?.response?.data?.Error ||
          'Failed to apply to join club';
        toast.error(message);
      },
    });
  };

  if (isLoadingClubs || isLoadingUserMemberships || isLoadingMembershipCounts) {
    return <div className="container page">Loading...</div>;
  }

  if (isErrorClubs || isErrorMembershipCounts) {
    return <div className="container page">Error fetching clubs</div>;
  }

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

      {clubsForDisplay.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No clubs found"
          hint="Try a different search term or category filter."
        />
      ) : (
        <div className="card-grid">
          {clubsForDisplay.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              onApply={handleApply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
