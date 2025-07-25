import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FicheQualiteRoutingModule } from './fiche-qualite-routing.module';
import { FicheQualiteComponent } from './fiche-qualite.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardChefComponent } from './dashboard-chef/dashboard-chef.component';

@NgModule({
  declarations: [
    FicheQualiteComponent,
    ListeComponent,
    FormulaireComponent,
    DashboardChefComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FicheQualiteRoutingModule,
    MatPaginatorModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,    
    MatToolbarModule, 
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class FicheQualiteModule { }
