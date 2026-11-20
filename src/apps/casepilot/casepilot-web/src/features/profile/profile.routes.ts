import type { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    title: 'Perfil | CasePilot',
    loadComponent: () => import('./pages/profile/profile.page').then(module => module.ProfilePage),
  },
];
