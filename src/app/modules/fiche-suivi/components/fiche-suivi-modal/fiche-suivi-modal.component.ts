import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FicheSuiviService } from 'src/app/services/fiche-suivi.service';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
import { UtilisateurService, Utilisateur } from 'src/app/services/utilisateur.service';
import { FicheQualite } from 'src/app/models/fiche-qualite';

@Component({
  selector: 'app-fiche-suivi-modal',
  templateUrl: './fiche-suivi-modal.component.html',
  styleUrls: ['./fiche-suivi-modal.component.scss']
})
export class FicheSuiviModalComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEditMode = false;
  
  // Listes avec valeurs par défaut (libellés français comme dans MongoDB)
  etatsAvancement: Nomenclature[] = [
    { type: 'STATUT', code: 'En cours', libelle: 'En cours', actif: true },
    { type: 'STATUT', code: 'Terminé', libelle: 'Terminé', actif: true },
    { type: 'STATUT', code: 'Bloqué', libelle: 'Bloqué', actif: true }
  ];
  
  // Liste des indicateurs KPI
  indicateursKpiOptions = [
    { value: 'STATUT', label: 'Statut', icon: 'flag' },
    { value: 'PRIORITE', label: 'Priorité', icon: 'priority_high' },
    { value: 'CATEGORIE_PROJET', label: 'Catégorie Projet', icon: 'folder' },
    { value: 'TYPE_FICHE', label: 'Type de Fiche', icon: 'category' }
  ];
  
  fichesQualite: FicheQualite[] = [];
  utilisateurs: Utilisateur[] = [];

  constructor(
    public dialogRef: MatDialogRef<FicheSuiviModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; ficheId?: string },
    private fb: FormBuilder,
    private ficheSuiviService: FicheSuiviService,
    private ficheQualiteService: FicheQualiteService,
    private nomenclatureService: NomenclatureService,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';
    
    this.form = this.fb.group({
      ficheId: ['', Validators.required],
      dateSuivi: [new Date(), Validators.required],
      etatAvancement: ['', Validators.required],
      problemes: [''],
      decisions: [''],
      indicateursKpi: [''],
      tauxConformite: [0, [Validators.min(0), Validators.max(100)]],
      delaiTraitementJours: [0, [Validators.min(0)]],
      ajoutePar: ['', Validators.required]
    });
    
    this.chargerDonnees();
    
    if (this.isEditMode && this.data.ficheId) {
      this.chargerFiche();
    }
  }
  
  chargerDonnees(): void {
    // Charger les fiches qualité
    this.ficheQualiteService.getAll().subscribe({
      next: data => {
        this.fichesQualite = data;
      },
      error: () => {
        this.fichesQualite = [];
      }
    });
    
    // Charger les utilisateurs
    this.utilisateurService.getUtilisateurs().subscribe({
      next: data => {
        this.utilisateurs = data;
      },
      error: () => {
        this.utilisateurs = [];
      }
    });
  }
  
  chargerFiche(): void {
    this.loading = true;
    
    this.ficheSuiviService.getById(this.data.ficheId!).subscribe({
      next: (fiche: any) => {
        // Mapper _id vers id si nécessaire
        if (fiche._id && !fiche.id) {
          fiche.id = fiche._id;
        }
        
        // Convertir la date
        let dateSuivi = new Date();
        if (fiche.dateSuivi) {
          if (typeof fiche.dateSuivi === 'string') {
            dateSuivi = new Date(fiche.dateSuivi);
          } else if (fiche.dateSuivi._seconds) {
            dateSuivi = new Date(fiche.dateSuivi._seconds * 1000);
          } else if (fiche.dateSuivi instanceof Date) {
            dateSuivi = fiche.dateSuivi;
          }
        }
        
        // Remplir le formulaire avec TOUTES les données
        this.form.patchValue({
          ficheId: fiche.ficheId || '',
          dateSuivi: dateSuivi,
          etatAvancement: fiche.etatAvancement || '',
          problemes: fiche.problemes || '',
          decisions: fiche.decisions || '',
          indicateursKpi: fiche.indicateursKpi || '',
          tauxConformite: fiche.tauxConformite !== null && fiche.tauxConformite !== undefined ? fiche.tauxConformite : 0,
          delaiTraitementJours: fiche.delaiTraitementJours !== null && fiche.delaiTraitementJours !== undefined ? fiche.delaiTraitementJours : 0,
          ajoutePar: fiche.ajoutePar || ''
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement fiche:', err);
        this.snackBar.open('❌ Erreur lors du chargement de la fiche', 'Fermer', { duration: 3000 });
        this.loading = false;
        this.dialogRef.close(false);
      }
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('⚠️ Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }
    
    this.loading = true;
    
    // Préparer les données EXACTEMENT comme le backend les attend
    const formValue = this.form.value;
    
    const payload: any = {
      ficheId: formValue.ficheId,
      dateSuivi: formValue.dateSuivi instanceof Date ? formValue.dateSuivi.toISOString() : new Date(formValue.dateSuivi).toISOString(),
      etatAvancement: formValue.etatAvancement,
      problemes: formValue.problemes && formValue.problemes.trim() !== '' ? formValue.problemes : 'Aucun problème signalé',
      decisions: formValue.decisions && formValue.decisions.trim() !== '' ? formValue.decisions : 'Aucune décision',
      indicateursKpi: formValue.indicateursKpi || '',
      tauxConformite: parseFloat(formValue.tauxConformite) || 0.0,
      delaiTraitementJours: parseFloat(formValue.delaiTraitementJours) || 0.0,
      ajoutePar: formValue.ajoutePar
    };
    
    const operation = this.isEditMode
      ? this.ficheSuiviService.update(this.data.ficheId!, payload)
      : this.ficheSuiviService.create(payload);
    
    operation.subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({ fiche: { ...payload, ...result, id: result.id || this.data.ficheId } });
      },
      error: (error: any) => {
        console.error('❌ Erreur:', error);
        this.loading = false;
        
        let msg = 'Erreur lors de l\'enregistrement';
        if (error.error?.message) msg = error.error.message;
        
        this.snackBar.open('❌ ' + msg, 'Fermer', { duration: 3000 });
      }
    });
  }
  
  onCancel(): void {
    this.dialogRef.close(false);
  }
  
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field?.hasError('min')) {
      return 'La valeur doit être positive';
    }
    if (field?.hasError('max')) {
      return 'La valeur ne peut pas dépasser 100';
    }
    return '';
  }
  
  getEtatIcon(code: string): string {
    const icons: { [key: string]: string } = {
      'En cours': 'pending',
      'Terminé': 'check_circle',
      'Bloqué': 'block',
      'En attente': 'schedule',
      'Validé': 'verified',
      // Anciens codes
      'EN_COURS': 'pending',
      'TERMINE': 'check_circle',
      'BLOQUE': 'block',
      'EN_ATTENTE': 'schedule',
      'VALIDE': 'verified'
    };
    return icons[code] || 'flag';
  }
  
  getEtatColor(code: string): string {
    const colors: { [key: string]: string } = {
      'En cours': '#ff9800',
      'Terminé': '#4caf50',
      'Bloqué': '#f44336',
      'En attente': '#2196f3',
      'Validé': '#4caf50',
      // Anciens codes
      'EN_COURS': '#ff9800',
      'TERMINE': '#4caf50',
      'BLOQUE': '#f44336',
      'EN_ATTENTE': '#2196f3',
      'VALIDE': '#4caf50'
    };
    return colors[code] || '#666';
  }
}
