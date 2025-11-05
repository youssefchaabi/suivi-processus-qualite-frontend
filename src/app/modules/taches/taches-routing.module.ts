import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TachesListComponent } from './pages/liste/liste.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TachesListComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TachesRoutingModule { }
