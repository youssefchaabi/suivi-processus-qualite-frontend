import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Nomenclature, NomenclatureType } from '../../../../../models/nomenclature.model';

@Component({
  selector: 'app-nomenclature-dialog',
  templateUrl: './nomenclature-dialog.component.html',
  styleUrls: ['./nomenclature-dialog.component.scss']
})
export class NomenclatureDialogComponent implements OnInit {
  nomenclatureForm: FormGroup;
  isEditMode: boolean;

  types: { value: NomenclatureType, label: string }[] = [
    { value: 'TYPE_FICHE', label: 'Type de Fiche' },
    { value: 'STATUT', label: 'Statut' },
    { value: 'CATEGORIE_PROJET', label: 'Catégorie Projet' },
    { value: 'PRIORITE', label: 'Priorité' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NomenclatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', type?: NomenclatureType, nomenclature?: Nomenclature }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.nomenclatureForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.nomenclature) {
      this.nomenclatureForm.patchValue(this.data.nomenclature);
    } else if (this.data.type) {
      this.nomenclatureForm.patchValue({ type: this.data.type });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      type: [this.data.type || 'TYPE_FICHE', Validators.required],
      code: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Z0-9_]+$/)]],
      libelle: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      actif: [true],
      ordre: [0, [Validators.min(0), Validators.max(999)]]
    });
  }

  onSubmit(): void {
    if (this.nomenclatureForm.valid) {
      const formValue = this.nomenclatureForm.value;
      // Normaliser le code en majuscules
      formValue.code = formValue.code.toUpperCase();
      this.dialogRef.close(formValue);
    } else {
      Object.keys(this.nomenclatureForm.controls).forEach(key => {
        this.nomenclatureForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.nomenclatureForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Ce champ est obligatoire';
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;
    if (control.errors['pattern']) return 'Format: MAJUSCULES, chiffres et underscores uniquement';
    if (control.errors['min']) return `Minimum ${control.errors['min'].min}`;
    if (control.errors['max']) return `Maximum ${control.errors['max'].max}`;
    return 'Champ invalide';
  }
}
