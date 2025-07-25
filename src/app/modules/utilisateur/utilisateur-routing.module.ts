import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  { path: '', component: ListeComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'utilisateurs/nouveau', component: FormulaireComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'modifier/:id', component: FormulaireComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilisateurRoutingModule { }
