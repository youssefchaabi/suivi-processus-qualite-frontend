import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FicheSuiviRoutingModule } from './fiche-suivi-routing.module';
import { FicheSuiviComponent } from './fiche-suivi.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { DashboardPiloteComponent } from './dashboard-pilote/dashboard-pilote.component';
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


@NgModule({
  declarations: [
    FicheSuiviComponent,
    ListeComponent,
    FormulaireComponent,
    DashboardPiloteComponent
  ],
  imports: [
    CommonModule,
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
    MatPaginatorModule
  ]
})
export class FicheSuiviModule { }
