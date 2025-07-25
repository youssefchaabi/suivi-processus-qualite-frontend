import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FicheQualiteComponent } from './fiche-qualite.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { DashboardChefComponent } from './dashboard-chef/dashboard-chef.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardChefComponent },
  { 
    path: '', 
    component: FicheQualiteComponent,
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
