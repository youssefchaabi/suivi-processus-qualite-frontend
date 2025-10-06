import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FicheQualiteComponent } from './fiche-qualite.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { DashboardChefComponent } from './dashboard-chef/dashboard-chef.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  { 
    path: 'dashboard', 
    component: DashboardChefComponent,
    canActivate: [AuthGuard],
    data: { role: 'CHEF_PROJET' }
  },
  { 
    path: '', 
    component: FicheQualiteComponent,
    canActivate: [AuthGuard],
    data: { role: ['ADMIN', 'CHEF_PROJET'] },
    children: [
      { path: '', component: ListeComponent },
      { path: 'nouveau', component: FormulaireComponent },
      { path: ':id', component: FormulaireComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FicheQualiteRoutingModule { }
