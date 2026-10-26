import { UserProfile } from '../../models/user';

export const MOCK_USER_PROFILE: UserProfile = {
  uid: 'user-demo-1',
  email: 'vince@mouthjournal.app',
  displayName: 'Vincent',
  username: 'vince_culinary',
  phoneNumber: '+6281234567890',
  bio: 'Penikmat kopi manual brew dan pencari ramen otentik di sudut Jakarta.',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  bannerURL: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80',
  culinaryPreferences: ['Kopi/Cafe', 'Ramen', 'Artisan Bakery', 'Wisata Alam'],
  favoriteVenueTypes: ['Cozy Café', 'Japanese Bistro', 'Open Air Park'],
  budgetPerVisit: 'Rp 50.000 - 150.000',
  favoriteLocations: ['Senopati', 'Blok M', 'Menteng'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-10-25T12:00:00.000Z',
};
