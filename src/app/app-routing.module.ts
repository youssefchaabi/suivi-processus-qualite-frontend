import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormulaireComponent } from './modules/utilisateur/formulaire/formulaire.component';

const routes: Routes = [{ path: 'utilisateurs', loadChildren: () => import('./modules/utilisateur/utilisateur.module').then(m => m.UtilisateurModule) },
  { path: '', redirectTo: 'utilisateurs', pathMatch: 'full' },
  { path: 'utilisateurs/nouveau',component: FormulaireComponent},
  { path: 'utilisateurs/:id',component: FormulaireComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
