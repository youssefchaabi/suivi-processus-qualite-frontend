import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsRoutingModule } from './notifications.routing';
import { NotificationsComponent } from './notifications.component';
import { NotificationsListComponent } from './pages/liste/notifications-list.component';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationsListComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NotificationsRoutingModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ]
})
export class NotificationsModule { } 