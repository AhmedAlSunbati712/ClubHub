import Avatar from '../common/Avatar.jsx';
import RoleBadge from '../common/RoleBadge.jsx';

// Admin "View All Students" table.
export default function StudentTable({ students = [] }) {
  return (
    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <span className="cell-user">
                  <Avatar name={student.name} size="sm" />
                  {student.name}
                </span>
              </td>
              <td>{student.email}</td>
              <td>
                <RoleBadge role={student.role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
