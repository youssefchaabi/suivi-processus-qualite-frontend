import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AuthGuard } from '../../guards/auth.guard';
import { FormulairesObligatoiresComponent } from './formulaires-obligatoires.component';

@NgModule({
  declarations: [FormulairesObligatoiresComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: FormulairesObligatoiresComponent, canActivate: [AuthGuard], data: { role: ['ADMIN','PILOTE_QUALITE'] } }
    ]),
    MatCardModule,
    MatTableModule,
    MatChipsModule
  ]
})
export class FormulairesObligatoiresModule {}

// Duplicate legacy module block removed to avoid double declaration