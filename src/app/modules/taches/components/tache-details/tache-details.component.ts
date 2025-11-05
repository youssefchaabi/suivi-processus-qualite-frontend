import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Tache, StatutTache, PrioriteTache } from '../../../../models/tache.model';

@Component({
  selector: 'app-tache-details',
  templateUrl: './tache-details.component.html',
  styleUrls: ['./tache-details.component.scss']
})
export class TacheDetailsComponent {
  StatutTache = StatutTache;
  PrioriteTache = PrioriteTache;

  constructor(
    public dialogRef: MatDialogRef<TacheDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tache: Tache }
  ) {}

  /**
   * Fermer le modal
   */
  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Obtenir la classe CSS pour le badge de statut
   */
  getStatutClass(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.A_FAIRE: return 'badge-a-faire';
      case StatutTache.EN_COURS: return 'badge-en-cours';
      case StatutTache.TERMINEE: return 'badge-terminee';
      case StatutTache.EN_RETARD: return 'badge-en-retard';
      default: return '';
    }
  }

  /**
   * Obtenir la classe CSS pour le badge de priorité
   */
  getPrioriteClass(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.HAUTE: return 'badge-haute';
      case PrioriteTache.MOYENNE: return 'badge-moyenne';
      case PrioriteTache.BASSE: return 'badge-basse';
      default: return '';
    }
  }

  /**
   * Formater le statut pour l'affichage
   */
  formatStatut(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.A_FAIRE: return 'À faire';
      case StatutTache.EN_COURS: return 'En cours';
      case StatutTache.TERMINEE: return 'Terminée';
      case StatutTache.EN_RETARD: return 'En retard';
      default: return statut;
    }
  }

  /**
   * Formater la priorité pour l'affichage
   */
  formatPriorite(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.HAUTE: return 'Haute';
      case PrioriteTache.MOYENNE: return 'Moyenne';
      case PrioriteTache.BASSE: return 'Basse';
      default: return priorite;
    }
  }

  /**
   * Obtenir l'icône pour une priorité
   */
  getPriorityIcon(priorite: PrioriteTache): string {
    switch (priorite) {
      case PrioriteTache.HAUTE: return 'priority_high';
      case PrioriteTache.MOYENNE: return 'remove';
      case PrioriteTache.BASSE: return 'arrow_downward';
      default: return 'flag';
    }
  }

  /**
   * Obtenir l'icône pour un statut
   */
  getStatusIcon(statut: StatutTache): string {
    switch (statut) {
      case StatutTache.A_FAIRE: return 'schedule';
      case StatutTache.EN_COURS: return 'hourglass_empty';
      case StatutTache.TERMINEE: return 'check_circle';
      case StatutTache.EN_RETARD: return 'warning';
      default: return 'track_changes';
    }
  }

  /**
   * Vérifier si une tâche est urgente
   */
  estUrgente(tache: Tache): boolean {
    if (!tache.dateEcheance || tache.statut === StatutTache.TERMINEE) {
      return false;
    }
    const aujourdhui = new Date();
    const echeance = new Date(tache.dateEcheance);
    const diffJours = Math.ceil((echeance.getTime() - aujourdhui.getTime()) / (1000 * 3600 * 24));
    return diffJours >= 0 && diffJours <= 3;
  }

  /**
   * Calculer les jours restants
   */
  getJoursRestants(tache: Tache): number {
    if (!tache.dateEcheance) return 0;
    const aujourdhui = new Date();
    const echeance = new Date(tache.dateEcheance);
    return Math.ceil((echeance.getTime() - aujourdhui.getTime()) / (1000 * 3600 * 24));
  }
}
