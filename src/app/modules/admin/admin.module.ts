import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthGuard } from '../../guards/auth.guard';

@NgModule({
  declarations: [
    AdminDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      }
    ]),
    MatCardModule,
    MatIconModule
  ]
})
export class AdminModule { }
