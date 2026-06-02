// Local sample data so every screen renders fully populated like the designs.
// Frontend-only placeholder — swap for the real API later.

// ---- Events (Upcoming Events page) ----
// userState: 'confirmed' | 'waitlisted' | 'none'
export const events = [
  {
    id: 'e1',
    title: 'Spring Hiking Trip Info Session',
    clubId: 'outing',
    club: 'Dartmouth Outing Club',
    date: '2026-05-26T19:00:00',
    location: 'Alumni Gym - Main Floor',
    description:
      'Join us to learn about our upcoming hiking trips to the White Mountains. All experience levels welcome.',
    filled: 234,
    capacity: 500,
    userState: 'confirmed',
  },
  {
    id: 'e2',
    title: 'Diwali Celebration Planning Meeting',
    clubId: 'sasa',
    club: 'South Asian Student Association',
    date: '2026-05-29T18:30:00',
    location: 'Collis Center - 100',
    description:
      "Help us plan this year's Diwali celebration. All members welcome to contribute ideas.",
    filled: 23,
    capacity: 50,
    userState: 'none',
  },
  {
    id: 'e3',
    title: 'Volunteer Orientation',
    clubId: 'outreach',
    club: 'Dartmouth Community Outreach',
    date: '2026-05-30T17:00:00',
    location: 'Class of 1953 Commons - Meeting Room 1',
    description:
      'Required orientation for new volunteers. Learn about our partner organizations and sign up for shifts.',
    filled: 25,
    capacity: 25,
    userState: 'none',
  },
  {
    id: 'e4',
    title: 'Startup Pitch Night',
    clubId: 'entrepreneurship',
    club: 'Entrepreneurship Club',
    date: '2026-06-05T19:00:00',
    location: 'Fahey Hall - 204',
    description:
      'Watch students pitch their startup ideas to a panel of local entrepreneurs and VCs.',
    filled: 31,
    capacity: 40,
    userState: 'waitlisted',
  },
  {
    id: 'e5',
    title: 'Introduction to React Workshop',
    clubId: 'cs',
    club: 'Dartmouth Computer Science Society',
    date: '2026-05-28T18:00:00',
    location: 'Sudikoff Lab - 115',
    description:
      'Learn the basics of React and build your first web application. Pizza will be provided!',
    filled: 67,
    capacity: 100,
    userState: 'confirmed',
  },
  {
    id: 'e6',
    title: 'Weekly Debate Practice',
    clubId: 'debate',
    club: 'Dartmouth Debate Society',
    date: '2026-05-27T17:30:00',
    location: 'Collis Center - 201',
    description:
      'Sharpen your parliamentary debate skills. Open to all members, beginners encouraged.',
    filled: 18,
    capacity: 20,
    userState: 'none',
  },
];

// ---- Clubs ----
const categoryOf = {
  cs: 'Academic',
  outing: 'Sports & Recreation',
  debate: 'Academic',
  acappella: 'Arts & Performance',
  sasa: 'Cultural & Identity',
  outreach: 'Community Service',
  entrepreneurship: 'Professional & Career',
  dartmouth: 'Media & Publications',
};

export const clubs = [
  {
    id: 'cs',
    name: 'Dartmouth Computer Science Society',
    category: categoryOf.cs,
    description:
      'A community for students interested in computer science, programming, and technology. We host workshops, hackathons, and tech talks.',
    memberCount: 145,
    viewerRole: 'Officer',
    president: { name: 'Sarah Chen' },
    officers: [
      { id: 'u1', name: 'Alex Thompson', role: 'Officer' },
      { id: 'u2', name: 'Sarah Chen', role: 'President' },
    ],
    events: ['e5', 'ev-mlai'],
    stats: { members: 145, officers: 2, upcomingEvents: 2 },
  },
  {
    id: 'outing',
    name: 'Dartmouth Outing Club',
    category: categoryOf.outing,
    description:
      'The oldest and largest outing club in America. Join us for hiking, skiing, camping, and outdoor adventures.',
    memberCount: 523,
    viewerRole: 'Member',
    president: null,
    officers: [],
    events: ['e1'],
    stats: { members: 523, officers: 0, upcomingEvents: 1 },
  },
  {
    id: 'debate',
    name: 'Dartmouth Debate Society',
    category: categoryOf.debate,
    description:
      'Competitive debate team focused on parliamentary and policy debate. All skill levels welcome.',
    memberCount: 67,
    viewerRole: null,
    president: null,
    officers: [],
    events: ['e6'],
    stats: { members: 67, officers: 0, upcomingEvents: 1 },
  },
  {
    id: 'acappella',
    name: 'Dartmouth A Cappella',
    category: categoryOf.acappella,
    description: 'Award-winning a cappella group performing across campus and beyond.',
    memberCount: 24,
    viewerRole: null,
    president: null,
    officers: [],
    events: [],
    stats: { members: 24, officers: 0, upcomingEvents: 0 },
  },
  {
    id: 'sasa',
    name: 'South Asian Student Association',
    category: categoryOf.sasa,
    description:
      'Celebrating South Asian culture through events, festivals, and community on campus.',
    memberCount: 189,
    viewerRole: null,
    president: null,
    officers: [],
    events: ['e2'],
    stats: { members: 189, officers: 0, upcomingEvents: 1 },
  },
  {
    id: 'outreach',
    name: 'Dartmouth Community Outreach',
    category: categoryOf.outreach,
    description: 'Connecting students with volunteer opportunities across the Upper Valley.',
    memberCount: 234,
    viewerRole: null,
    president: null,
    officers: [],
    events: ['e3'],
    stats: { members: 234, officers: 0, upcomingEvents: 1 },
  },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship Club',
    category: categoryOf.entrepreneurship,
    description: 'Building the next generation of founders through pitch nights and mentorship.',
    memberCount: 156,
    viewerRole: 'Member',
    president: null,
    officers: [],
    events: ['e4'],
    stats: { members: 156, officers: 0, upcomingEvents: 1 },
  },
  {
    id: 'dartmouth',
    name: 'The Dartmouth',
    category: categoryOf.dartmouth,
    description: "America's oldest college newspaper, published since 1799.",
    memberCount: 89,
    viewerRole: null,
    president: null,
    officers: [],
    events: [],
    stats: { members: 89, officers: 0, upcomingEvents: 0 },
  },
];

// Extra event referenced by CS club detail
events.push({
  id: 'ev-mlai',
  title: 'ML/AI Guest Speaker',
  clubId: 'cs',
  club: 'Dartmouth Computer Science Society',
  date: '2026-06-10T18:00:00',
  location: 'Sudikoff Lab - 115',
  description:
    'Guest speaker from Google AI will discuss the future of machine learning. Q&A to follow.',
  filled: 89,
  capacity: 100,
  userState: 'none',
});

// ---- Club management (members / pending) keyed by club id ----
export const clubMembers = {
  cs: [
    {
      id: 'u1',
      name: 'Alex Thompson',
      email: 'alex.thompson.26@dartmouth.edu',
      role: 'Officer',
      joinDate: '2025-09-14',
    },
    {
      id: 'u2',
      name: 'Sarah Chen',
      email: 'sarah.chen.25@dartmouth.edu',
      role: 'President',
      joinDate: '2025-09-14',
    },
  ],
};

export const clubPending = {
  cs: [
    {
      id: 'p1',
      name: 'Marcus Johnson',
      email: 'marcus.johnson.26@dartmouth.edu',
      appliedOn: '2025-11-04',
    },
  ],
};

// ---- Current user (profile + nav) ----
export const currentUser = {
  id: 'u1',
  name: 'Alex Thompson',
  email: 'alex.thompson.26@dartmouth.edu',
  role: 'Admin',
  clubRoles: { cs: 'Officer' },
  myClubs: [
    {
      id: 'cs',
      name: 'Dartmouth Computer Science Society',
      category: 'Academic',
      joinDate: '2025-09-14',
      role: 'Officer',
    },
    {
      id: 'outing',
      name: 'Dartmouth Outing Club',
      category: 'Sports & Recreation',
      joinDate: '2025-09-19',
      role: 'Member',
    },
    {
      id: 'entrepreneurship',
      name: 'Entrepreneurship Club',
      category: 'Professional & Career',
      joinDate: '2026-01-09',
      role: 'Member',
    },
  ],
  quickStats: {
    activeClubs: 3,
    pendingApplications: 0,
    upcomingEvents: 3,
    officerRoles: 1,
  },
  upcomingEvents: [
    {
      id: 'e1',
      title: 'Spring Hiking Trip Info Session',
      club: 'Dartmouth Outing Club',
      date: '2026-05-26T19:00:00',
      location: 'Alumni Gym - Main Floor',
      status: 'confirmed',
    },
    {
      id: 'e5',
      title: 'Introduction to React Workshop',
      club: 'Dartmouth Computer Science Society',
      date: '2026-05-28T18:00:00',
      location: 'Sudikoff Lab - 115',
      status: 'confirmed',
    },
    {
      id: 'e4',
      title: 'Startup Pitch Night',
      club: 'Entrepreneurship Club',
      date: '2026-06-05T19:00:00',
      location: 'Fahey Hall - 204',
      status: 'waitlisted',
    },
  ],
};

// ---- Admin dashboard ----
export const adminStats = {
  totals: {
    clubs: 8,
    events: 8,
    students: 3,
    memberships: 7,
  },
  topClubs: [
    { id: 'outing', name: 'Dartmouth Outing Club', memberCount: 523 },
    { id: 'outreach', name: 'Dartmouth Community Outreach', memberCount: 234 },
    { id: 'sasa', name: 'South Asian Student Association', memberCount: 189 },
    { id: 'entrepreneurship', name: 'Entrepreneurship Club', memberCount: 156 },
    { id: 'cs', name: 'Dartmouth Computer Science Society', memberCount: 145 },
  ],
  upcomingEvents: [
    { id: 'e1', title: 'Spring Hiking Trip Info Session', club: 'Dartmouth Outing Club', date: '2026-05-26T19:00:00', filled: 234, capacity: 500 },
    { id: 'e6', title: 'Weekly Debate Practice', club: 'Dartmouth Debate Society', date: '2026-05-27T17:30:00', filled: 18, capacity: 20 },
    { id: 'e5', title: 'Introduction to React Workshop', club: 'Dartmouth Computer Science Society', date: '2026-05-28T18:00:00', filled: 67, capacity: 100 },
    { id: 'e2', title: 'Diwali Celebration Planning Meeting', club: 'South Asian Student Association', date: '2026-05-29T18:30:00', filled: 23, capacity: 50 },
    { id: 'e3', title: 'Volunteer Orientation', club: 'Dartmouth Community Outreach', date: '2026-05-30T17:00:00', filled: 25, capacity: 25 },
  ],
};

// ---- Locations (buildings + rooms) ----
export const buildings = [
  {
    id: 'collis',
    name: 'Collis Center',
    rooms: [
      { id: 'collis-100', name: '100', seats: 50 },
      { id: 'collis-201', name: '201', seats: 30 },
    ],
  },
  {
    id: 'baker',
    name: 'Baker Library',
    rooms: [{ id: 'baker-conf-a', name: 'Conference Room A', seats: 20 }],
  },
  {
    id: 'sudikoff',
    name: 'Sudikoff Lab',
    rooms: [{ id: 'sudikoff-115', name: '115', seats: 100 }],
  },
  {
    id: 'hopkins',
    name: 'Hopkins Center',
    rooms: [{ id: 'hopkins-moore', name: 'Moore Theater', seats: 300 }],
  },
  {
    id: 'alumni',
    name: 'Alumni Gym',
    rooms: [{ id: 'alumni-main', name: 'Main Floor', seats: 500 }],
  },
  {
    id: 'commons',
    name: 'Class of 1953 Commons',
    rooms: [{ id: 'commons-mr1', name: 'Meeting Room 1', seats: 25 }],
  },
  {
    id: 'fahey',
    name: 'Fahey Hall',
    rooms: [{ id: 'fahey-204', name: '204', seats: 40 }],
  },
];

// Flattened rows for the locations table
export const locationRows = buildings.flatMap((b) =>
  b.rooms.map((r) => ({ id: r.id, building: b.name, room: r.name, capacity: r.seats }))
);

// Helpers
export const getClub = (id) => clubs.find((c) => c.id === id) ?? null;
export const getEventsByIds = (ids = []) =>
  ids.map((id) => events.find((e) => e.id === id)).filter(Boolean);

export const eventCategories = ['Academic', 'Social', 'Sports & Recreation', 'Cultural & Identity'];
export const clubCategories = [
  'Academic',
  'Sports & Recreation',
  'Arts & Performance',
  'Cultural & Identity',
  'Community Service',
  'Professional & Career',
  'Media & Publications',
];
