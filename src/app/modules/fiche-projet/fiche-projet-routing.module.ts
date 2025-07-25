import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormulaireProjetComponent } from './pages/formulaire/formulaire-projet.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ListeProjetComponent } from './pages/liste/liste-projet.component';

const routes: Routes = [
  { path: '', component: ListeProjetComponent, canActivate: [AuthGuard], data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] } },
  { path: 'nouveau', component: FormulaireProjetComponent, canActivate: [AuthGuard], data: { role: ['ADMIN', 'CHEF_PROJET'] } },
  { path: 'modifier/:id', component: FormulaireProjetComponent, canActivate: [AuthGuard], data: { role: ['ADMIN', 'CHEF_PROJET'] } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FicheProjetRoutingModule { } 