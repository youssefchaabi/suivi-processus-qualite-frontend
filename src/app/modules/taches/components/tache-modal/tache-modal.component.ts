import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tache, PrioriteTache, StatutTache } from '../../../../models/tache.model';
import { FicheProjet } from '../../../../models/fiche-projet';
import { TacheService } from '../../../../services/tache.service';
import { FicheProjetService } from '../../../../services/fiche-projet.service';

@Component({
  selector: 'app-tache-modal',
  templateUrl: './tache-modal.component.html',
  styleUrls: ['./tache-modal.component.scss']
})
export class TacheModalComponent implements OnInit {
  tacheForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  projets: FicheProjet[] = [];

  priorites = [
    { value: PrioriteTache.HAUTE, label: 'Haute' },
    { value: PrioriteTache.MOYENNE, label: 'Moyenne' },
    { value: PrioriteTache.BASSE, label: 'Basse' }
  ];

  statuts = [
    { value: StatutTache.A_FAIRE, label: 'À faire' },
    { value: StatutTache.EN_COURS, label: 'En cours' },
    { value: StatutTache.TERMINEE, label: 'Terminée' }
  ];

  constructor(
    private fb: FormBuilder,
    private tacheService: TacheService,
    private ficheProjetService: FicheProjetService,
    public dialogRef: MatDialogRef<TacheModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tache: Tache | null, userId: string }
  ) {
    this.isEditMode = !!data.tache;
    this.tacheForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadProjets();
    if (this.isEditMode && this.data.tache) {
      this.populateForm(this.data.tache);
    }
  }

  /**
   * Créer le formulaire
   */
  createForm(): FormGroup {
    return this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      projetId: ['', Validators.required],
      dateEcheance: ['', Validators.required],
      priorite: [PrioriteTache.MOYENNE, Validators.required],
      statut: [StatutTache.A_FAIRE, Validators.required]
    });
  }

  /**
   * Charger les projets
   */
  loadProjets(): void {
    this.ficheProjetService.getAll().subscribe({
      next: (projets) => {
        this.projets = projets;
      },
      error: (error) => {
        console.error('Erreur chargement projets:', error);
      }
    });
  }

  /**
   * Peupler le formulaire en mode édition
   */
  populateForm(tache: Tache): void {
    this.tacheForm.patchValue({
      titre: tache.titre,
      description: tache.description,
      projetId: tache.projetId,
      dateEcheance: tache.dateEcheance,
      priorite: tache.priorite,
      statut: tache.statut
    });
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.tacheForm.valid) {
      this.isLoading = true;

      const formValue = this.tacheForm.value;
      
      const tacheData: Tache = {
        titre: formValue.titre,
        description: formValue.description || '',
        projetId: formValue.projetId,
        dateEcheance: formValue.dateEcheance,
        priorite: formValue.priorite,
        statut: formValue.statut,
        creePar: this.data.userId
      };

      console.log('Envoi tâche:', tacheData);

      const operation = this.isEditMode && this.data.tache?.id
        ? this.tacheService.updateTache(this.data.tache.id, tacheData)
        : this.tacheService.createTache(tacheData);

      operation.subscribe({
        next: (result) => {
          console.log('Tâche sauvegardée:', result);
          this.isLoading = false;
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Erreur sauvegarde tâche:', error);
          this.isLoading = false;
          // L'erreur sera gérée par le composant parent avec un snackbar
          this.dialogRef.close(null);
        }
      });
    } else {
      console.error('Formulaire invalide:', this.tacheForm.errors);
      Object.keys(this.tacheForm.controls).forEach(key => {
        const control = this.tacheForm.get(key);
        if (control?.invalid) {
          console.error(`Champ ${key} invalide:`, control.errors);
        }
      });
    }
  }

  /**
   * Annuler
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.tacheForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (field?.hasError('minlength')) {
      return 'Minimum 3 caractères requis';
    }
    return '';
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
      default: return 'track_changes';
    }
  }
}
