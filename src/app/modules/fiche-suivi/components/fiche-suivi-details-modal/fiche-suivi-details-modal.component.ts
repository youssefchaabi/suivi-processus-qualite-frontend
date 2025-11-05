import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FicheSuivi } from 'src/app/models/fiche-suivi';

@Component({
  selector: 'app-fiche-suivi-details-modal',
  templateUrl: './fiche-suivi-details-modal.component.html',
  styleUrls: ['./fiche-suivi-details-modal.component.scss']
})
export class FicheSuiviDetailsModalComponent {
  
  constructor(
    public dialogRef: MatDialogRef<FicheSuiviDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fiche: FicheSuivi; ficheQualiteTitre?: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getEtatIcon(etat: string): string {
    const icons: { [key: string]: string } = {
      'EN_COURS': 'pending',
      'TERMINE': 'check_circle',
      'BLOQUE': 'block',
      'EN_ATTENTE': 'schedule',
      'VALIDE': 'verified'
    };
    return icons[etat] || 'flag';
  }

  getEtatColor(etat: string): string {
    const colors: { [key: string]: string } = {
      'EN_COURS': '#ff9800',
      'TERMINE': '#4caf50',
      'BLOQUE': '#f44336',
      'EN_ATTENTE': '#2196f3',
      'VALIDE': '#4caf50'
    };
    return colors[etat] || '#666';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Non définie';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getConformiteClass(taux: number | undefined): string {
    if (!taux) return 'conformite-low';
    if (taux >= 80) return 'conformite-high';
    if (taux >= 50) return 'conformite-medium';
    return 'conformite-low';
  }

  getConformiteIcon(taux: number | undefined): string {
    if (!taux) return 'trending_down';
    if (taux >= 80) return 'trending_up';
    if (taux >= 50) return 'trending_flat';
    return 'trending_down';
  }
}
