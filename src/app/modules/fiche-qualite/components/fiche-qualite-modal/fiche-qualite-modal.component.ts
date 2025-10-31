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
  
  // INITIALISATION IMMÉDIATE DES TABLEAUX AVEC VALEURS PAR DÉFAUT
  typesFiche: Nomenclature[] = [
    { type: 'TYPE_FICHE', code: 'AUDIT', libelle: 'Audit', actif: true },
    { type: 'TYPE_FICHE', code: 'CONTROLE', libelle: 'Contrôle', actif: true },
    { type: 'TYPE_FICHE', code: 'AMELIORATION', libelle: 'Amélioration', actif: true },
    { type: 'TYPE_FICHE', code: 'FORMATION', libelle: 'Formation', actif: true },
    { type: 'TYPE_FICHE', code: 'MAINTENANCE', libelle: 'Maintenance', actif: true },
    { type: 'TYPE_FICHE', code: 'AUTRE', libelle: 'Autre', actif: true }
  ];
  
  statuts: Nomenclature[] = [
    { type: 'STATUT', code: 'EN_COURS', libelle: 'En cours', actif: true },
    { type: 'STATUT', code: 'TERMINEE', libelle: 'Terminée', actif: true },
    { type: 'STATUT', code: 'VALIDEE', libelle: 'Validée', actif: true },
    { type: 'STATUT', code: 'REJETEE', libelle: 'Rejetée', actif: true },
    { type: 'STATUT', code: 'EN_ATTENTE', libelle: 'En attente', actif: true },
    { type: 'STATUT', code: 'BLOQUEE', libelle: 'Bloquée', actif: true }
  ];
  
  categories: Nomenclature[] = [
    { type: 'CATEGORIE_PROJET', code: 'DEVELOPPEMENT', libelle: 'Développement', actif: true },
    { type: 'CATEGORIE_PROJET', code: 'INFRASTRUCTURE', libelle: 'Infrastructure', actif: true },
    { type: 'CATEGORIE_PROJET', code: 'QUALITE', libelle: 'Qualité', actif: true },
    { type: 'CATEGORIE_PROJET', code: 'SECURITE', libelle: 'Sécurité', actif: true },
    { type: 'CATEGORIE_PROJET', code: 'FORMATION', libelle: 'Formation', actif: true }
  ];
  
  priorites: Nomenclature[] = [
    { type: 'PRIORITE', code: 'HAUTE', libelle: 'Haute', actif: true },
    { type: 'PRIORITE', code: 'MOYENNE', libelle: 'Moyenne', actif: true },
    { type: 'PRIORITE', code: 'BASSE', libelle: 'Basse', actif: true }
  ];
  
  utilisateurs: Utilisateur[] = [];

  constructor(
    public dialogRef: MatDialogRef<FicheQualiteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; ficheId?: string },
    private fb: FormBuilder,
    private ficheQualiteService: FicheQualiteService,
    private nomenclatureService: NomenclatureService,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar
  ) {
    console.log('🎯 CONSTRUCTOR - Valeurs par défaut initialisées');
    console.log('Types de fiche:', this.typesFiche.length);
    console.log('Statuts:', this.statuts.length);
    console.log('Catégories:', this.categories.length);
    console.log('Priorités:', this.priorites.length);
  }

  ngOnInit(): void {
    console.log('🚀 ngOnInit - Début initialisation');
    this.isEditMode = this.data.mode === 'edit';
    
    console.log('📋 Vérification tableaux AVANT création formulaire:');
    console.log('- typesFiche:', this.typesFiche);
    console.log('- statuts:', this.statuts);
    console.log('- categories:', this.categories);
    console.log('- priorites:', this.priorites);
    
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
    
    console.log('✅ Formulaire créé');
    
    this.chargerNomenclatures();
    this.chargerUtilisateurs();
    
    if (this.isEditMode && this.data.ficheId) {
      this.chargerFiche();
    }
  }
  
  chargerNomenclatures(): void {
    console.log('🔄 Tentative de chargement depuis API...');
    console.log('📊 Valeurs actuelles - Types:', this.typesFiche.length, 'Statuts:', this.statuts.length);
    
    // Charger depuis l'API (remplacera les valeurs par défaut si disponible)
    this.nomenclatureService.getNomenclaturesByType('TYPE_FICHE').subscribe({
      next: data => {
        console.log('📥 API Response TYPE_FICHE:', data);
        if (data && data.length > 0) {
          const actifs = data.filter(n => n.actif);
          if (actifs.length > 0) {
            this.typesFiche = actifs;
            console.log('✅ Types de fiche mis à jour depuis API:', this.typesFiche);
          }
        }
      },
      error: (err) => {
        console.warn('⚠️ Erreur chargement types, conservation valeurs par défaut:', err);
        console.log('📋 Types actuels:', this.typesFiche);
      }
    });
    
    this.nomenclatureService.getNomenclaturesByType('STATUT').subscribe({
      next: data => {
        console.log('📥 API Response STATUT:', data);
        if (data && data.length > 0) {
          const actifs = data.filter(n => n.actif);
          if (actifs.length > 0) {
            this.statuts = actifs;
            console.log('✅ Statuts mis à jour depuis API:', this.statuts);
          }
        }
      },
      error: (err) => {
        console.warn('⚠️ Erreur chargement statuts, conservation valeurs par défaut:', err);
        console.log('📋 Statuts actuels:', this.statuts);
      }
    });
    
    this.nomenclatureService.getNomenclaturesByType('CATEGORIE_PROJET').subscribe({
      next: data => {
        console.log('📥 API Response CATEGORIE_PROJET:', data);
        if (data && data.length > 0) {
          const actifs = data.filter(n => n.actif);
          if (actifs.length > 0) {
            this.categories = actifs;
            console.log('✅ Catégories mises à jour depuis API:', this.categories);
          }
        }
      },
      error: (err) => {
        console.warn('⚠️ Erreur chargement catégories, conservation valeurs par défaut:', err);
        console.log('📋 Catégories actuelles:', this.categories);
      }
    });
    
    this.nomenclatureService.getNomenclaturesByType('PRIORITE').subscribe({
      next: data => {
        console.log('📥 API Response PRIORITE:', data);
        if (data && data.length > 0) {
          const actifs = data.filter(n => n.actif);
          if (actifs.length > 0) {
            this.priorites = actifs;
            console.log('✅ Priorités mises à jour depuis API:', this.priorites);
          }
        }
      },
      error: (err) => {
        console.warn('⚠️ Erreur chargement priorités, conservation valeurs par défaut:', err);
        console.log('📋 Priorités actuelles:', this.priorites);
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
