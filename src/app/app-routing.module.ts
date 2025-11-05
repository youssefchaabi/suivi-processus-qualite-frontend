import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormulaireComponent } from './modules/utilisateur/pages/formulaire/formulaire.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthorizedComponent } from './modules/auth/unauthorized/unauthorized.component';
import { KpiComponent } from './kpi/kpi.component';
import { LandingComponent } from './pages/landing/landing.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'home', component: LandingComponent },
  { path: 'utilisateurs', loadChildren: () => import('./modules/utilisateur/utilisateur.module').then(m => m.UtilisateurModule) },
  { path: 'nomenclatures', canActivate: [AuthGuard], loadChildren: () => import('./modules/nomenclature/nomenclature.module').then(m => m.NomenclatureModule), data: { role: 'ADMIN' } },
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
{ path: 'ai-dashboard', canActivate: [AuthGuard], loadChildren: () => import('./modules/ai-dashboard/ai-dashboard.module').then(m => m.AiDashboardModule), data: { role: 'PILOTE_QUALITE' } },
{ path: 'notifications', canActivate: [AuthGuard], loadChildren: () => import('./modules/notifications/notifications.module').then(m => m.NotificationsModule), data: { role: ['ADMIN', 'PILOTE_QUALITE', 'CHEF_PROJET'] } },
{ path: 'rapports', canActivate: [AuthGuard], loadChildren: () => import('./modules/rapports/rapports.module').then(m => m.RapportsModule), data: { role: 'PILOTE_QUALITE' } },
{ path: 'historique', canActivate: [AuthGuard], loadChildren: () => import('./modules/historique/historique.module').then(m => m.HistoriqueModule), data: { role: ['ADMIN', 'PILOTE_QUALITE'] } },
{ path: 'formulaires-obligatoires', canActivate: [AuthGuard], loadChildren: () => import('./modules/formulaires-obligatoires/formulaires-obligatoires.module').then(m => m.FormulairesObligatoiresModule), data: { role: ['ADMIN', 'PILOTE_QUALITE'] } },
{ path: 'fiche-projet', canActivate: [AuthGuard], loadChildren: () => import('./modules/fiche-projet/fiche-projet.module').then(m => m.FicheProjetModule), data: { role: ['ADMIN', 'CHEF_PROJET'] } },
{ path: 'taches', canActivate: [AuthGuard], loadChildren: () => import('./modules/taches/taches.module').then(m => m.TachesModule), data: { role: ['ADMIN', 'CHEF_PROJET'] } },
{ path: 'unauthorized', component: UnauthorizedComponent },
{ path: '**', redirectTo: '' } // Rediriger vers home au lieu de login
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top', // Scroll en haut à chaque navigation
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
