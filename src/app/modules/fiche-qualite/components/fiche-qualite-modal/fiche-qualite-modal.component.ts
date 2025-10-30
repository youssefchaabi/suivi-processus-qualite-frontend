import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
import { UtilisateurService, Utilisateur } from 'src/app/services/utilisateur.service';

@Component({
  selector: 'app-fiche-qualite-modal',
  templateUrl: './fiche-qualite-modal.component.html',
  styleUrls: ['./fiche-qualite-modal.component.scss']
})
export class FicheQualiteModalComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEditMode = false;
  
  typesFiche: Nomenclature[] = [];
  statuts: Nomenclature[] = [];
  categories: Nomenclature[] = [];
  priorites: Nomenclature[] = [];
  utilisateurs: Utilisateur[] = [];

  constructor(
    public dialogRef: MatDialogRef<FicheQualiteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; ficheId?: string },
    private fb: FormBuilder,
    private ficheQualiteService: FicheQualiteService,
    private nomenclatureService: NomenclatureService,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';
    
    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      typeFiche: ['', Validators.required],
      statut: ['', Validators.required],
      categorie: [''],
      priorite: [''],
      responsable: ['', Validators.required],
      dateEcheance: ['', Validators.required],
      observations: ['']
    });
    
    this.chargerNomenclatures();
    this.chargerUtilisateurs();
    
    if (this.isEditMode && this.data.ficheId) {
      this.chargerFiche();
    }
  }
  
  chargerNomenclatures(): void {
    // Charger Types de Fiche
    this.nomenclatureService.getNomenclaturesByType('TYPE_FICHE').subscribe({
      next: data => {
        this.typesFiche = data.filter(n => n.actif);
        console.log('✅ Types de fiche chargés:', this.typesFiche.length);
      },
      error: () => {
        // Valeurs par défaut si erreur
        this.typesFiche = [
          { type: 'TYPE_FICHE', code: 'AUDIT', libelle: 'Audit', actif: true },
          { type: 'TYPE_FICHE', code: 'CONTROLE', libelle: 'Contrôle', actif: true },
          { type: 'TYPE_FICHE', code: 'AMELIORATION', libelle: 'Amélioration', actif: true }
        ];
      }
    });
    
    // Charger Statuts
    this.nomenclatureService.getNomenclaturesByType('STATUT').subscribe({
      next: data => {
        this.statuts = data.filter(n => n.actif);
        console.log('✅ Statuts chargés:', this.statuts.length);
      },
      error: () => {
        this.statuts = [
          { type: 'STATUT', code: 'EN_COURS', libelle: 'En cours', actif: true },
          { type: 'STATUT', code: 'VALIDE', libelle: 'Validé', actif: true },
          { type: 'STATUT', code: 'CLOTURE', libelle: 'Clôturé', actif: true }
        ];
      }
    });
    
    // Charger Catégories
    this.nomenclatureService.getNomenclaturesByType('CATEGORIE_PROJET').subscribe({
      next: data => {
        this.categories = data.filter(n => n.actif);
      },
      error: () => {
        this.categories = [];
      }
    });
    
    // Charger Priorités
    this.nomenclatureService.getNomenclaturesByType('PRIORITE').subscribe({
      next: data => {
        this.priorites = data.filter(n => n.actif);
      },
      error: () => {
        this.priorites = [];
      }
    });
  }
  
  chargerUtilisateurs(): void {
    this.utilisateurService.getUtilisateurs().subscribe({
      next: data => {
        this.utilisateurs = data;
        console.log('✅ Utilisateurs chargés:', this.utilisateurs.length);
      },
      error: () => {
        this.utilisateurs = [];
      }
    });
  }
  
  chargerFiche(): void {
    this.loading = true;
    this.ficheQualiteService.getById(this.data.ficheId!).subscribe({
      next: (fiche: any) => {
        // Convertir la date si nécessaire
        if (fiche.dateEcheance && typeof fiche.dateEcheance === 'string') {
          fiche.dateEcheance = new Date(fiche.dateEcheance);
        }
        this.form.patchValue(fiche);
        this.loading = false;
      },
      error: () => {
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
    const fiche = this.form.value;
    
    // Convertir la date si nécessaire
    if (fiche.dateEcheance && typeof fiche.dateEcheance !== 'object') {
      fiche.dateEcheance = new Date(fiche.dateEcheance);
    }
    
    const operation = this.isEditMode
      ? this.ficheQualiteService.update(this.data.ficheId!, fiche)
      : this.ficheQualiteService.create(fiche);
    
    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? '✅ Fiche modifiée avec succès' : '✅ Fiche créée avec succès',
          'Fermer',
          { duration: 3000 }
        );
        this.dialogRef.close(true); // Retourner true pour recharger la liste
      },
      error: (error: any) => {
        console.error('❌ Erreur:', error);
        this.snackBar.open(
          '❌ Erreur lors de l\'enregistrement: ' + (error.error?.message || error.message),
          'Fermer',
          { duration: 5000 }
        );
        this.loading = false;
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
    return '';
  }
  
  getTypeIcon(code: string | undefined): string {
    if (!code) return 'description';
    const icons: { [key: string]: string } = {
      'AUDIT': 'fact_check',
      'CONTROLE': 'verified',
      'AMELIORATION': 'trending_up',
      'FORMATION': 'school',
      'MAINTENANCE': 'build',
      'AUTRE': 'more_horiz'
    };
    return icons[code] || 'description';
  }

  getStatutIcon(code: string | undefined): string {
    if (!code) return 'flag';
    const icons: { [key: string]: string } = {
      'EN_COURS': 'pending',
      'VALIDE': 'check_circle',
      'CLOTURE': 'archive'
    };
    return icons[code] || 'flag';
  }

  getStatutColor(code: string | undefined): string {
    if (!code) return '#666';
    const colors: { [key: string]: string } = {
      'EN_COURS': '#ff9800',
      'VALIDE': '#4caf50',
      'CLOTURE': '#9e9e9e'
    };
    return colors[code] || '#666';
  }
}
