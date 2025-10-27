import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UtilisateurRoutingModule } from './utilisateur-routing.module';
import { UtilisateurComponent } from './utilisateur.component';
import { ListeComponent } from './pages/liste/liste.component';
import { FormulaireComponent } from './pages/formulaire/formulaire.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';
import { UtilisateurModalComponent } from './components/utilisateur-modal/utilisateur-modal.component';


@NgModule({
  declarations: [
    UtilisateurComponent,
    ListeComponent,
    FormulaireComponent,
    UtilisateurModalComponent
  ],
  imports: [
    CommonModule,
    UtilisateurRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    OverlayModule,
    MatCardModule,
    MatDialogModule,
    MatSortModule,
    MatSnackBarModule
  ]
})
export class UtilisateurModule { }
