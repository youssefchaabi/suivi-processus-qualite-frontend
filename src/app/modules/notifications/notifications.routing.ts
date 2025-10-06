import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { NotificationsListComponent } from './pages/liste/notifications-list.component';

const routes: Routes = [
  { path: '', component: NotificationsListComponent, canActivate: [AuthGuard], data: { role: ['ADMIN', 'PILOTE_QUALITE', 'CHEF_PROJET'] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule {}


