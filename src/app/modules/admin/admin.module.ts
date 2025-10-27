import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthGuard } from '../../guards/auth.guard';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    AdminDashboardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      }
    ]),
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class AdminModule { }
