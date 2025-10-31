import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { SharedModule } from '../../shared/shared.module';
import { FicheQualiteRoutingModule } from './fiche-qualite-routing.module';
import { FicheQualiteComponent } from './fiche-qualite.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FicheQualiteModalComponent } from './components/fiche-qualite-modal/fiche-qualite-modal.component';
import { FicheQualiteDetailsModalComponent } from './components/fiche-qualite-details-modal/fiche-qualite-details-modal.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { DashboardChefComponent } from './dashboard-chef/dashboard-chef.component';

@NgModule({
  declarations: [
    FicheQualiteComponent,
    ListeComponent,
    FicheQualiteModalComponent,
    FicheQualiteDetailsModalComponent,
    FormulaireComponent,
    DashboardChefComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    FicheQualiteRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class FicheQualiteModule { }
