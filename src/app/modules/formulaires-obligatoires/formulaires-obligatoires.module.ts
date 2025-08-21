import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Components
import { FormulairesObligatoiresComponent } from './formulaires-obligatoires.component';

// Services
import { FormulairesObligatoiresService } from '../../services/formulaires-obligatoires.service';
import { UtilisateurService } from '../../services/utilisateur.service';

@NgModule({
  declarations: [
    FormulairesObligatoiresComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: FormulairesObligatoiresComponent }
    ]),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  providers: [
    FormulairesObligatoiresService,
    UtilisateurService
  ]
})
export class FormulairesObligatoiresModule { } 