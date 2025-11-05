import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FicheSuiviRoutingModule } from './fiche-suivi-routing.module';
import { FicheSuiviComponent } from './fiche-suivi.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { DashboardPiloteComponent } from './dashboard-pilote/dashboard-pilote.component';
import { FicheSuiviModalComponent } from './components/fiche-suivi-modal/fiche-suivi-modal.component';
import { FicheSuiviDetailsModalComponent } from './components/fiche-suivi-details-modal/fiche-suivi-details-modal.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    FicheSuiviComponent,
    ListeComponent,
    FormulaireComponent,
    DashboardPiloteComponent,
    FicheSuiviModalComponent,
    FicheSuiviDetailsModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FicheSuiviRoutingModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatTableModule,
    FormsModule,
    MatTooltipModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressBarModule
  ]
})
export class FicheSuiviModule { }
