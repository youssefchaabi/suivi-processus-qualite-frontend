import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  // ... autres routes admin ...
];

export const adminRoutes = routes; 