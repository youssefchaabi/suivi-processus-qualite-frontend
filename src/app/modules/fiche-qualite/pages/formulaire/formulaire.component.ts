import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
import { UtilisateurService, Utilisateur } from 'src/app/services/utilisateur.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessSnackbarComponent } from 'src/app/shared/success-snackbar/success-snackbar.component';

@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss']
})
export class FormulaireComponent implements OnInit {
  form: FormGroup;
  modeEdition = false;
  ficheId: string | null = null;
  loading = false;
  fichesExistantes: FicheQualite[] = [];
  erreurDoublon = false;

  // Nomenclatures dynamiques avec valeurs par défaut (CORRESPONDANT AU BACKEND)
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
  // Liste des utilisateurs pour le champ responsable
  utilisateurs: Utilisateur[] = [];

  constructor(
    private fb: FormBuilder,
    private ficheService: FicheQualiteService,
    private nomenclatureService: NomenclatureService,
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      typeFiche: ['', Validators.required],
      statut: ['EN_COURS', Validators.required],
      responsable: ['', Validators.required],
      dateEcheance: ['', Validators.required],
      categorie: [''],
      priorite: [''],
      observations: [''],
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    console.log('🚀 INIT FORMULAIRE FICHE QUALITÉ');
    console.log('📋 Types de fiches AVANT chargement:', this.typesFiche);
    console.log('📋 Statuts AVANT chargement:', this.statuts);
    
    this.ficheId = this.route.snapshot.paramMap.get('id');
    if (this.ficheId) {
      this.modeEdition = true;
      this.chargerFiche();
    }
    this.chargerNomenclatures();
    this.chargerUtilisateurs();
    
    console.log('📋 Types de fiches APRÈS init:', this.typesFiche);
    console.log('📋 Statuts APRÈS init:', this.statuts);
  }

  chargerNomenclatures(): void {
    console.log('🔄 Chargement des nomenclatures depuis l\'API...');
    
    // Charger les types de fiches depuis l'API
    this.nomenclatureService.getNomenclaturesByType('TYPE_FICHE').subscribe({
      next: (data) => {
        console.log('✅ Types de fiches reçus:', data);
        if (data && data.length > 0) {
          // Filtrer uniquement les actifs
          const typesActifs = data.filter(t => t.actif === true);
          if (typesActifs.length > 0) {
            this.typesFiche = typesActifs;
            console.log('✅ Types de fiches chargés:', this.typesFiche);
          } else {
            console.warn('⚠️ Aucun type actif, conservation des valeurs par défaut');
          }
        } else {
          console.warn('⚠️ Aucune donnée reçue, conservation des valeurs par défaut');
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement types:', error);
        console.log('✅ Conservation des valeurs par défaut');
      }
    });

    // Charger les statuts depuis l'API
    this.nomenclatureService.getNomenclaturesByType('STATUT').subscribe({
      next: (data) => {
        console.log('✅ Statuts reçus:', data);
        if (data && data.length > 0) {
          // Filtrer uniquement les actifs
          const statutsActifs = data.filter(s => s.actif === true);
          if (statutsActifs.length > 0) {
            this.statuts = statutsActifs;
            console.log('✅ Statuts chargés:', this.statuts);
          } else {
            console.warn('⚠️ Aucun statut actif, conservation des valeurs par défaut');
          }
        } else {
          console.warn('⚠️ Aucune donnée reçue, conservation des valeurs par défaut');
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement statuts:', error);
        console.log('✅ Conservation des valeurs par défaut');
      }
    });
  }

  chargerUtilisateurs(): void {
    console.log('🔄 Chargement des utilisateurs...');
    this.utilisateurService.getUtilisateurs().subscribe({
      next: (users) => {
        console.log('✅ Utilisateurs reçus:', users);
        if (users && users.length > 0) {
          this.utilisateurs = users;
          if (!this.modeEdition) {
            // Utiliser l'email au lieu du nom
            this.form.patchValue({ responsable: users[0].email });
          }
        } else {
          console.warn('⚠️ Aucun utilisateur reçu');
          this.utilisateurs = [];
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement utilisateurs:', error);
        this.utilisateurs = [];
      }
    });
  }

  chargerFiche(): void {
    if (!this.ficheId) return;
    
    this.loading = true;
    this.ficheService.getById(this.ficheId).subscribe({
      next: (fiche) => {
        this.form.patchValue({
          titre: fiche.titre,
          description: fiche.description,
          typeFiche: fiche.typeFiche,
          statut: fiche.statut,
          responsable: fiche.responsable,
          dateEcheance: fiche.dateEcheance,
          categorie: fiche.categorie,
          priorite: fiche.priorite,
          observations: fiche.observations,
          commentaire: fiche.commentaire
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.snackBar.open('Erreur lors du chargement de la fiche', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      console.error('❌ Formulaire invalide:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.error(`  - ${key}:`, control.errors);
        }
      });
      return;
    }

    // Construire les données de la fiche
    const formValue = this.form.value;
    console.log('📋 Valeurs du formulaire:', formValue);

    const ficheData: FicheQualite = {
      titre: formValue.titre?.trim() || '',
      description: formValue.description?.trim() || '',
      typeFiche: formValue.typeFiche || '',
      statut: formValue.statut || '',
      responsable: formValue.responsable || '',  // Email maintenant
      dateEcheance: formValue.dateEcheance || new Date(),
      categorie: formValue.categorie || undefined,
      priorite: formValue.priorite || undefined,
      observations: formValue.observations?.trim() || undefined,
      commentaire: formValue.commentaire?.trim() || undefined
    };

    console.log('📤 Données à envoyer:', ficheData);

    // Vérification doublon (hors édition sur soi-même)
    const doublon = this.fichesExistantes.some(f =>
      ((f.titre || '').trim().toLowerCase() === (ficheData.titre || '').trim().toLowerCase()) &&
      (f.typeFiche === ficheData.typeFiche) &&
      (!this.modeEdition || f.id !== this.ficheId)
    );
    
    if (doublon) {
      this.erreurDoublon = true;
      this.loading = false;
      this.snackBar.open('❌ Doublon : une fiche avec ce titre et ce type existe déjà', 'Fermer', {
        duration: 3500,
        panelClass: ['snackbar-error']
      });
      return;
    } else {
      this.erreurDoublon = false;
    }

    this.loading = true;
    
    if (this.modeEdition && this.ficheId) {
      console.log('🔄 Mise à jour de la fiche:', this.ficheId);
      this.ficheService.update(this.ficheId, ficheData).subscribe({
        next: (response) => {
          console.log('✅ Fiche mise à jour:', response);
          this.loading = false;
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Fiche qualité mise à jour avec succès!' },
            duration: 3000
          });
          // Redirection vers la liste
          this.router.navigate(['/fiche-qualite']);
        },
        error: (error) => {
          console.error('❌ Erreur mise à jour:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          
          let errorMessage = 'Erreur lors de la mise à jour';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les champs.';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      console.log('➕ Création d\'une nouvelle fiche');
      this.ficheService.create(ficheData).subscribe({
        next: (response) => {
          console.log('✅ Fiche créée:', response);
          this.loading = false;
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Fiche qualité créée avec succès!' },
            duration: 3000
          });
          // Redirection vers la liste
          this.router.navigate(['/fiche-qualite']);
        },
        error: (error) => {
          console.error('❌ Erreur création:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('Error body:', error.error);
          
          let errorMessage = 'Erreur lors de la création';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Données invalides. Vérifiez les champs.';
          }
          
          this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  annuler(): void {
    this.router.navigate(['/fiche-qualite']);
  }

  getTypeIcon(typeCode: string): string {
    switch (typeCode?.toUpperCase()) {
      case 'AUDIT':
        return 'fact_check';
      case 'CONTROLE':
        return 'verified';
      case 'VERIFICATION':
        return 'check_circle';
      case 'INSPECTION':
        return 'search';
      default:
        return 'description';
    }
  }

  getStatutIcon(statutCode: string): string {
    switch (statutCode?.toUpperCase()) {
      case 'VALIDEE':
      case 'TERMINE':
        return 'check_circle';
      case 'REFUSEE':
      case 'BLOQUE':
        return 'cancel';
      case 'EN_COURS':
        return 'pending';
      case 'EN_ATTENTE':
        return 'schedule';
      default:
        return 'flag';
    }
  }
}
