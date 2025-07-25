import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FicheSuiviComponent } from './fiche-suivi.component';
import { DashboardPiloteComponent } from './dashboard-pilote/dashboard-pilote.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardPiloteComponent },
  { path: 'liste', component: ListeComponent },
  { path: 'formulaire', component: FormulaireComponent },
  { path: 'formulaire/:id', component: FormulaireComponent },
  { path: '', redirectTo: 'liste', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FicheSuiviRoutingModule { }
