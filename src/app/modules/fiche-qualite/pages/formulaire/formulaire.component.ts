import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
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

  // Nomenclatures dynamiques
  typesFiche: Nomenclature[] = [];
  statuts: Nomenclature[] = [];
  responsables: Nomenclature[] = [];

  constructor(
    private fb: FormBuilder,
    private ficheService: FicheQualiteService,
    private nomenclatureService: NomenclatureService,
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
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    this.chargerNomenclatures();
    // Charger toutes les fiches pour vérifier les doublons
    this.ficheService.getAll().subscribe(data => { this.fichesExistantes = data; });
    this.ficheId = this.route.snapshot.paramMap.get('id');
    
    if (this.ficheId) {
      this.modeEdition = true;
      this.chargerFiche();
    }
  }

  chargerNomenclatures(): void {
    // Charger les types de fiches
    this.nomenclatureService.getNomenclaturesByType('TYPE_FICHE').subscribe({
      next: (data) => {
        this.typesFiche = data;
        if (data.length > 0 && !this.modeEdition) {
          this.form.patchValue({ typeFiche: data[0].valeur });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des types de fiches:', error);
        // Fallback vers des valeurs par défaut
        this.typesFiche = [
          { type: 'TYPE_FICHE', valeur: 'AUDIT' },
          { type: 'TYPE_FICHE', valeur: 'CONTROLE' },
          { type: 'TYPE_FICHE', valeur: 'VERIFICATION' },
          { type: 'TYPE_FICHE', valeur: 'INSPECTION' }
        ];
      }
    });

    // Charger les statuts
    this.nomenclatureService.getNomenclaturesByType('STATUT').subscribe({
      next: (data) => {
        this.statuts = data;
        if (data.length > 0 && !this.modeEdition) {
          this.form.patchValue({ statut: data[0].valeur });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statuts:', error);
        // Fallback vers des valeurs par défaut
        this.statuts = [
          { type: 'STATUT', valeur: 'EN_COURS' },
          { type: 'STATUT', valeur: 'VALIDEE' },
          { type: 'STATUT', valeur: 'REFUSEE' },
          { type: 'STATUT', valeur: 'EN_ATTENTE' }
        ];
      }
    });

    // Charger les responsables (utilisateurs)
    this.nomenclatureService.getNomenclaturesByType('RESPONSABLE').subscribe({
      next: (data) => {
        this.responsables = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des responsables:', error);
        // Fallback vers des valeurs par défaut
        this.responsables = [
          { type: 'RESPONSABLE', valeur: 'Chef Projet A' },
          { type: 'RESPONSABLE', valeur: 'Chef Projet B' },
          { type: 'RESPONSABLE', valeur: 'Pilote Qualité' }
        ];
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
    if (this.form.invalid) return;

    // Vérification doublon (hors édition sur soi-même)
    const ficheData: FicheQualite = {
      ...this.form.value,
      creePar: 'Utilisateur actuel', // À remplacer par l'utilisateur connecté
      dateCreation: new Date(),
      dateDerniereModification: new Date()
    };
    const doublon = this.fichesExistantes.some(f =>
      f.titre.trim().toLowerCase() === ficheData.titre.trim().toLowerCase() &&
      f.typeFiche === ficheData.typeFiche &&
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
      this.ficheService.update(this.ficheId, ficheData).subscribe({
        next: () => {
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Fiche qualité mise à jour avec succès!' },
            duration: 3000
          });
          this.router.navigate(['/fiche-qualite']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.ficheService.create(ficheData).subscribe({
        next: () => {
          this.snackBar.openFromComponent(SuccessSnackbarComponent, {
            data: { message: 'Fiche qualité créée avec succès!' },
            duration: 3000
          });
          this.router.navigate(['/fiche-qualite']);
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  annuler(): void {
    this.router.navigate(['/fiche-qualite']);
  }
}
