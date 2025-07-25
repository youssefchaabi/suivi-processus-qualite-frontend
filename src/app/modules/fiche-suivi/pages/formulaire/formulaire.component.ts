import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FicheSuivi } from 'src/app/models/fiche-suivi';
import { FicheSuiviService } from 'src/app/services/fiche-suivi.service';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
import { FicheQualiteService } from 'src/app/services/fiche-qualite.service';
import { FicheQualite } from 'src/app/models/fiche-qualite';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-formulaire',
  templateUrl: './formulaire.component.html',
  styleUrls: ['./formulaire.component.scss']
})
export class FormulaireComponent implements OnInit {
  form: FormGroup;
  modeEdition = false;
  ficheSuiviId: string | null = null;
  loading = false;

  // Nomenclatures dynamiques
  etats: Nomenclature[] = [];
  kpis: Nomenclature[] = [];
  responsables: Nomenclature[] = [];
  fichesQualite: FicheQualite[] = [];
  selectedFicheQualite: FicheQualite | null = null;
  fichesSuiviExistantes: FicheSuivi[] = [];
  erreurDoublon = false;

  constructor(
    private fb: FormBuilder,
    private ficheSuiviService: FicheSuiviService,
    private nomenclatureService: NomenclatureService,
    private ficheQualiteService: FicheQualiteService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.form = this.fb.group({
      ficheId: ['', Validators.required],
      dateSuivi: ['', Validators.required],
      etatAvancement: ['', Validators.required],
      problemes: [''],
      decisions: [''],
      indicateursKpi: [''],
      ajoutePar: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.chargerNomenclatures();
    this.chargerFichesQualite();
    // Charger toutes les fiches de suivi pour vérifier les doublons
    this.ficheSuiviService.getAll().subscribe(data => { this.fichesSuiviExistantes = data; });
    this.ficheSuiviId = this.route.snapshot.paramMap.get('id');
    if (this.ficheSuiviId) {
      this.modeEdition = true;
      this.chargerFicheSuivi();
    }
  }

  chargerNomenclatures(): void {
    this.nomenclatureService.getNomenclaturesByType('STATUT').subscribe({
      next: (data) => { this.etats = data; },
      error: () => {
        this.etats = [
          { type: 'STATUT', valeur: 'EN_COURS' },
          { type: 'STATUT', valeur: 'TERMINE' },
          { type: 'STATUT', valeur: 'BLOQUE' }
        ];
      }
    });
    this.nomenclatureService.getNomenclaturesByType('KPI').subscribe({
      next: (data) => { this.kpis = data; },
      error: () => {
        this.kpis = [
          { type: 'KPI', valeur: 'Taux conformité' },
          { type: 'KPI', valeur: 'Délai traitement' }
        ];
      }
    });
    this.nomenclatureService.getNomenclaturesByType('RESPONSABLE').subscribe({
      next: (data) => {
        this.responsables = data && data.length > 0 ? data : [
          { type: 'RESPONSABLE', valeur: 'Chef Projet A' },
          { type: 'RESPONSABLE', valeur: 'Pilote Qualité' }
        ];
      },
      error: () => {
        this.responsables = [
          { type: 'RESPONSABLE', valeur: 'Chef Projet A' },
          { type: 'RESPONSABLE', valeur: 'Pilote Qualité' }
        ];
      }
    });
  }

  chargerFichesQualite(): void {
    this.ficheQualiteService.getAll().subscribe({
      next: (data) => {
        this.fichesQualite = data;
        // Si une fiche est déjà sélectionnée (édition), on la retrouve
        if (this.form.get('ficheId')?.value) {
          this.selectedFicheQualite = this.fichesQualite.find(f => f.id === this.form.get('ficheId')?.value) || null;
        }
      },
      error: () => { this.fichesQualite = []; }
    });
  }

  onFicheQualiteChange(ficheId: string) {
    this.selectedFicheQualite = this.fichesQualite.find(f => f.id === ficheId) || null;
  }

  chargerFicheSuivi(): void {
    if (!this.ficheSuiviId) return;
    this.loading = true;
    this.ficheSuiviService.getById(this.ficheSuiviId).subscribe({
      next: (fiche) => {
        this.form.patchValue({
          ficheId: fiche.ficheId,
          dateSuivi: fiche.dateSuivi,
          etatAvancement: fiche.etatAvancement,
          problemes: fiche.problemes,
          decisions: fiche.decisions,
          indicateursKpi: fiche.indicateursKpi,
          ajoutePar: fiche.ajoutePar
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    // Vérification doublon (hors édition sur soi-même)
    const ficheData: FicheSuivi = {
      ...this.form.value,
      dateSuivi: this.form.value.dateSuivi ? new Date(this.form.value.dateSuivi).toISOString() : ''
    };
    const doublon = this.fichesSuiviExistantes.some(f =>
      f.ficheId === ficheData.ficheId &&
      new Date(f.dateSuivi).toISOString().slice(0,10) === new Date(ficheData.dateSuivi).toISOString().slice(0,10) &&
      (!this.modeEdition || f.id !== this.ficheSuiviId)
    );
    if (doublon) {
      this.erreurDoublon = true;
      this.loading = false;
      this.snackBar.open('❌ Doublon : une fiche de suivi existe déjà pour cette fiche qualité à cette date', 'Fermer', {
        duration: 3500,
        panelClass: ['snackbar-error']
      });
      return;
    } else {
      this.erreurDoublon = false;
    }
    this.loading = true;
    if (this.modeEdition && this.ficheSuiviId) {
      this.ficheSuiviService.update(this.ficheSuiviId, ficheData).subscribe({
        next: () => {
          this.snackBar.open('Fiche de suivi mise à jour avec succès!', 'Fermer', { duration: 3000 });
          this.router.navigate(['/fiche-suivi']);
        },
        error: () => { this.loading = false; }
      });
    } else {
      this.ficheSuiviService.create(ficheData).subscribe({
        next: () => {
          this.snackBar.open('Fiche de suivi créée avec succès!', 'Fermer', { duration: 3000 });
          this.router.navigate(['/fiche-suivi']);
        },
        error: () => { this.loading = false; }
      });
    }
  }

  annuler(): void {
    this.router.navigate(['/fiche-suivi']);
  }
}
