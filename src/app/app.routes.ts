import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news.page').then( m => m.NewsPage)
  },
  {
    path: 'api',
    loadComponent: () => import('./pages/api/api.page').then( m => m.APIPage)
  },
];
