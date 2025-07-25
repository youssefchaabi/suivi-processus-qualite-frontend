import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormulaireComponent } from './modules/utilisateur/pages/formulaire/formulaire.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthorizedComponent } from './modules/auth/unauthorized/unauthorized.component';
import { KpiComponent } from './kpi/kpi.component';

const routes: Routes = [{ path: 'utilisateurs', loadChildren: () => import('./modules/utilisateur/utilisateur.module').then(m => m.UtilisateurModule) },
  { path: 'nomenclatures', canActivate: [AuthGuard], loadChildren: () => import('./modules/nomenclature/nomenclature.module').then(m => m.NomenclatureModule), data: { role: 'ADMIN' } },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'utilisateurs/nouveau',component: FormulaireComponent},
  { path: 'utilisateurs/:id',component: FormulaireComponent},
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },

  {
  path: 'admin',
  canActivate: [AuthGuard],
  loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
  data: { role: 'ADMIN' }
},
{
  path: 'fiche-qualite',
  canActivate: [AuthGuard],
  loadChildren: () =>
    import('./modules/fiche-qualite/fiche-qualite.module').then(m => m.FicheQualiteModule),
  data: { role: ['ADMIN', 'CHEF_PROJET'] }
},
{
  path: 'fiche-suivi',
  canActivate: [AuthGuard],
  loadChildren: () =>
    import('./modules/fiche-suivi/fiche-suivi.module').then(m => m.FicheSuiviModule)
},
{ path: 'kpi', component: KpiComponent, canActivate: [AuthGuard], data: { role: 'PILOTE_QUALITE' } },
{ path: 'fiche-projet', canActivate: [AuthGuard], loadChildren: () => import('./modules/fiche-projet/fiche-projet.module').then(m => m.FicheProjetModule), data: { role: ['ADMIN', 'CHEF_PROJET', 'PILOTE_QUALITE'] } },
{ path: 'unauthorized', component: UnauthorizedComponent }, // Crée ce composant si besoin
{ path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
