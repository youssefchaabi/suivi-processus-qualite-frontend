import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Nomenclature } from '../../models/nomenclature.model';
import { NomenclatureService } from '../../services/nomenclature.service';

@Component({
  selector: 'app-nomenclature-modal',
  templateUrl: './nomenclature-modal.component.html',
  styleUrls: ['./nomenclature-modal.component.scss']
})
export class NomenclatureModalComponent implements OnInit {
  nomenclatureForm!: FormGroup;
  loading = false;
  isEditMode = false;

  typesNomenclature = [
    { value: 'TYPE_FICHE', label: 'Type de Fiche', icon: 'description', color: '#388e3c' },
    { value: 'STATUT', label: 'Statut', icon: 'flag', color: '#1976d2' },
    { value: 'CATEGORIE_PROJET', label: 'Catégorie Projet', icon: 'category', color: '#f57c00' },
    { value: 'PRIORITE', label: 'Priorité', icon: 'priority_high', color: '#d32f2f' },
    { value: 'KPI', label: 'KPI', icon: 'analytics', color: '#9c27b0' }
  ];

  constructor(
    public dialogRef: MatDialogRef<NomenclatureModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nomenclature?: Nomenclature },
    private fb: FormBuilder,
    private nomenclatureService: NomenclatureService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.nomenclature;
    this.initForm();
  }

  initForm(): void {
    this.nomenclatureForm = this.fb.group({
      type: [this.data?.nomenclature?.type || '', Validators.required],
      libelle: [this.data?.nomenclature?.libelle || '', [Validators.required, Validators.minLength(2)]],
      actif: [this.data?.nomenclature?.actif ?? true, Validators.required]
    });
  }

  getSelectedTypeInfo() {
    const type = this.nomenclatureForm.get('type')?.value;
    return this.typesNomenclature.find(t => t.value === type);
  }

  onSubmit(): void {
    if (this.nomenclatureForm.valid) {
      this.loading = true;
      
      const type = this.nomenclatureForm.get('type')?.value;
      const libelle = this.nomenclatureForm.get('libelle')?.value.trim();
      const actif = this.nomenclatureForm.get('actif')?.value;
      
      // Générer automatiquement le code basé sur le libellé
      const code = this.isEditMode && this.data.nomenclature?.code 
        ? this.data.nomenclature.code 
        : libelle.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
      
      const payload = {
        type: type,
        code: code,
        libelle: libelle,
        actif: actif
      };
      
      console.log('=== ENVOI PAYLOAD ===', payload);

      const operation = this.isEditMode
        ? this.nomenclatureService.update(this.data.nomenclature!.id!, payload)
        : this.nomenclatureService.create(payload);

      operation.subscribe({
        next: (result: any) => {
          this.loading = false;
          this.snackBar.open(
            this.isEditMode ? 'Nomenclature modifiée avec succès ✅' : 'Nomenclature créée avec succès ✅',
            'Fermer',
            { duration: 3000 }
          );
          this.dialogRef.close(result);
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Erreur:', error);
          this.snackBar.open(
            error.error?.message || 'Erreur lors de l\'enregistrement ❌',
            'Fermer',
            { duration: 5000 }
          );
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
