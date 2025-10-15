import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthGuard } from '../../guards/auth.guard';
import { RapportsComponent } from './rapports.component';

@NgModule({
  declarations: [RapportsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: RapportsComponent, canActivate: [AuthGuard], data: { role: 'PILOTE_QUALITE' } }
    ]),
    MatCardModule,
    MatButtonModule
  ]
})
export class RapportsModule {}
// Duplicate legacy module block removed to avoid double declaration