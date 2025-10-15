import { Component } from '@angular/core';
import { FicheSuiviService } from 'src/app/services/fiche-suivi.service';

@Component({
  selector: 'app-formulaires-obligatoires',
  template: `
    <mat-card>
      <mat-card-title>Formulaires obligatoires en retard</mat-card-title>
      <table mat-table [dataSource]="data" class="mat-elevation-z2" *ngIf="data.length" style="margin-top: 12px;">
        <ng-container matColumnDef="titre">
          <th mat-header-cell *matHeaderCellDef> Fiche </th>
          <td mat-cell *matCellDef="let row"> {{ row.ficheId }} </td>
        </ng-container>
        <ng-container matColumnDef="delai">
          <th mat-header-cell *matHeaderCellDef> Délai (j) </th>
          <td mat-cell *matCellDef="let row">
            <mat-chip color="warn" selected *ngIf="row.delaiTraitementJours != null">{{ row.delaiTraitementJours }}</mat-chip>
            <span *ngIf="row.delaiTraitementJours == null">-</span>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayed"></tr>
        <tr mat-row *matRowDef="let row; columns: displayed;"></tr>
      </table>
      <div *ngIf="!data.length" style="text-align:center; color:#888; padding: 16px;">Aucun formulaire en retard</div>
    </mat-card>
  `
})
export class FormulairesObligatoiresComponent {
  data: any[] = [];
  displayed = ['titre','delai'];
  constructor(private suiviService: FicheSuiviService) {
    this.suiviService.getAll().subscribe((list: any) => {
      const items = (list as any[] || []).filter(x => typeof x.delaiTraitementJours === 'number' && x.delaiTraitementJours > 15);
      this.data = items;
    });
  }
} 