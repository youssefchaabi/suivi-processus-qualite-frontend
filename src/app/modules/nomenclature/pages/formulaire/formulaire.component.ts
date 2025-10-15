import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NomenclatureService, Nomenclature } from 'src/app/services/nomenclature.service';

@Component({
  selector: 'app-nomenclature-formulaire',
  template: `
    <mat-card>
      <mat-card-title>{{ id ? 'Modifier' : 'Créer' }} une nomenclature</mat-card-title>
      <form [formGroup]="form" (ngSubmit)="save()" style="display:grid; gap:16px; margin-top:12px;">
        <mat-form-field appearance="outline">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="nom" required />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Valeur</mat-label>
          <input matInput formControlName="valeur" required />
        </mat-form-field>
        <div style="display:flex; gap:12px;">
          <button mat-raised-button color="primary" [disabled]="form.invalid">Enregistrer</button>
          <button mat-stroked-button type="button" (click)="cancel()">Annuler</button>
        </div>
      </form>
    </mat-card>
  `
})
export class FormulaireComponent implements OnInit {
  id: string | null = null;
  form = this.fb.group({
    nom: ['', Validators.required],
    valeur: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private service: NomenclatureService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.service.getById(this.id).subscribe(n => this.form.patchValue(n));
    }
  }

  save() {
    const payload: Nomenclature = { id: this.id || undefined, ...this.form.value } as any;
    const obs = this.id ? this.service.updateNomenclature(this.id!, payload) : this.service.createNomenclature(payload);
    obs.subscribe({
      next: () => { this.snack.open('Enregistré','Fermer',{ duration: 1500 }); this.router.navigate(['/nomenclatures']); },
      error: () => this.snack.open('Erreur lors de la sauvegarde','Fermer',{ duration: 2000 })
    });
  }

  cancel() { this.router.navigate(['/nomenclatures']); }
}