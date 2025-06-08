import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur.component';
import { ListeComponent } from './liste/liste.component';
import { FormulaireComponent } from './formulaire/formulaire.component';

const routes: Routes = [{ path: '', component: ListeComponent  },
  { path: 'utilisateurs/nouveau', component: FormulaireComponent },
  { path: 'modifier/:id', component: FormulaireComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilisateurRoutingModule { }
