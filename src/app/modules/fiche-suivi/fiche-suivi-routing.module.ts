import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FicheSuiviComponent } from './fiche-suivi.component';
import { DashboardPiloteComponent } from './dashboard-pilote/dashboard-pilote.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  { 
    path: 'dashboard', 
    component: DashboardPiloteComponent,
    canActivate: [AuthGuard],
    data: { role: 'PILOTE_QUALITE' }
  },
  { 
    path: 'liste', 
    component: ListeComponent,
    canActivate: [AuthGuard],
    data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] }
  },
  { 
    path: 'formulaire', 
    component: FormulaireComponent,
    canActivate: [AuthGuard],
    data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] }
  },
  { 
    path: 'formulaire/:id', 
    component: FormulaireComponent,
    canActivate: [AuthGuard],
    data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] }
  },
  { path: '', redirectTo: 'liste', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FicheSuiviRoutingModule { }
