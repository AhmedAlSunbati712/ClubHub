import { useState } from 'react';

// admin "View All Students". TODO: wire to api/students.js.
export function useStudents() {
  const [students] = useState([]);
  const [loading] = useState(false);
  const [error] = useState(null);

  return { students, loading, error };
}
