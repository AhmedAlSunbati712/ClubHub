import ClubRow from '../clubs/ClubRow.jsx';

// Manage Clubs table.
export default function ClubTable({ clubs = [], onEdit, onDelete }) {
  return (
    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Club Name</th>
            <th>Category</th>
            <th className="col-num">Members</th>
            <th>President</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <ClubRow key={club.id} club={club} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
