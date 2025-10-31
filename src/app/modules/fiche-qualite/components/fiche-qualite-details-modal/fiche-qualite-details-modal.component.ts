import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FicheQualite } from 'src/app/models/fiche-qualite';

@Component({
  selector: 'app-fiche-qualite-details-modal',
  templateUrl: './fiche-qualite-details-modal.component.html',
  styleUrls: ['./fiche-qualite-details-modal.component.scss']
})
export class FicheQualiteDetailsModalComponent {
  
  constructor(
    public dialogRef: MatDialogRef<FicheQualiteDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public fiche: FicheQualite
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'AUDIT': 'fact_check',
      'CONTROLE': 'verified',
      'AMELIORATION': 'trending_up',
      'FORMATION': 'school',
      'MAINTENANCE': 'build',
      'AUTRE': 'more_horiz'
    };
    return icons[type] || 'description';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'AUDIT': '#2196f3',
      'CONTROLE': '#4caf50',
      'AMELIORATION': '#ff9800',
      'FORMATION': '#9c27b0',
      'MAINTENANCE': '#795548',
      'AUTRE': '#607d8b'
    };
    return colors[type] || '#666';
  }

  getStatutIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'EN_COURS': 'pending',
      'VALIDE': 'check_circle',
      'VALIDEE': 'check_circle',
      'CLOTURE': 'archive',
      'TERMINEE': 'done_all',
      'REJETEE': 'cancel',
      'EN_ATTENTE': 'schedule',
      'BLOQUEE': 'block'
    };
    return icons[statut] || 'flag';
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'EN_COURS': '#ff9800',
      'VALIDE': '#4caf50',
      'VALIDEE': '#4caf50',
      'CLOTURE': '#9e9e9e',
      'TERMINEE': '#4caf50',
      'REJETEE': '#f44336',
      'EN_ATTENTE': '#ff9800',
      'BLOQUEE': '#f44336'
    };
    return colors[statut] || '#666';
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
}
