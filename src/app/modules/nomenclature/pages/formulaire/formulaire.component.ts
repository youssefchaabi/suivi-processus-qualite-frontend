import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';
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
  nomenclatureId: string | null = null;
  typesDisponibles = ['STATUT', 'TYPE_FICHE', 'RESPONSABLE', 'KPI'];
  nomenclaturesExistantes: Nomenclature[] = [];
  erreurDoublon = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private nomenclatureService: NomenclatureService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {
    this.form = this.fb.group({
      type: ['', Validators.required],
      valeur: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.nomenclatureId = this.route.snapshot.paramMap.get('id');
    this.modeEdition = !!this.nomenclatureId;

    // Charger toutes les nomenclatures pour vérifier les doublons
    this.nomenclatureService.getNomenclatures().subscribe(data => {
      this.nomenclaturesExistantes = data;
      if (this.modeEdition && this.nomenclatureId) {
        const nomenclature = data.find(n => n.id === this.nomenclatureId);
        if (nomenclature) {
          this.form.patchValue(nomenclature);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const nomenclature: Nomenclature = this.form.value;

    // Vérification doublon (hors édition sur soi-même)
    const doublon = this.nomenclaturesExistantes.some(n =>
      n.type === nomenclature.type &&
      n.valeur.trim().toLowerCase() === nomenclature.valeur.trim().toLowerCase() &&
      (!this.modeEdition || n.id !== this.nomenclatureId)
    );
    if (doublon) {
      this.erreurDoublon = true;
      this.loading = false;
      this.snackBar.open('❌ Doublon : cette valeur existe déjà pour ce type', 'Fermer', {
        duration: 3500,
        panelClass: ['snackbar-error']
      });
      return;
    } else {
      this.erreurDoublon = false;
    }

    if (this.modeEdition && this.nomenclatureId) {
      this.nomenclatureService.updateNomenclature(this.nomenclatureId, nomenclature).subscribe(() => {
        this.snackBar.open('✅ Nomenclature mise à jour avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loading = false;
        this.router.navigate(['/nomenclatures']);
      }, () => { this.loading = false; });
    } else {
      this.nomenclatureService.createNomenclature(nomenclature).subscribe(() => {
        this.snackBar.open('✅ Nomenclature ajoutée avec succès', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loading = false;
        this.router.navigate(['/nomenclatures']);
      }, () => { this.loading = false; });
    }
  }
} 