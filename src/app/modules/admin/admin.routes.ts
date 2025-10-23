import { Routes } from '@angular/router';
import { AdminGuard } from '../../guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'utilisateurs',
        loadChildren: () => import('./pages/utilisateurs/utilisateurs.module').then(m => m.UtilisateursModule)
      },
      {
        path: 'nomenclatures',
        loadChildren: () => import('./pages/nomenclatures/nomenclatures.module').then(m => m.NomenclaturesModule)
      },
      {
        path: '',
        redirectTo: 'utilisateurs',
        pathMatch: 'full'
      }
    ]
  }
];
