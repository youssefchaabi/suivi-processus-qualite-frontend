import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Nomenclature, NomenclatureService } from 'src/app/services/nomenclature.service';

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
    { value: 'RESPONSABLE', label: 'Responsable', icon: 'person', color: '#607d8b' },
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
      
      // Générer automatiquement code et libellé basés sur le type
      const typeInfo = this.getSelectedTypeInfo();
      const type = this.nomenclatureForm.get('type')?.value;
      const actif = this.nomenclatureForm.get('actif')?.value;
      
      let payload: any;
      
      console.log('=== PRÉPARATION PAYLOAD ===');
      console.log('Mode édition:', this.isEditMode);
      console.log('Type sélectionné:', type);
      console.log('Actif:', actif);
      console.log('TypeInfo:', typeInfo);
      console.log('Data nomenclature:', this.data.nomenclature);
      
      if (!this.isEditMode) {
        // Pour création: générer code et libellé automatiquement
        const timestamp = Date.now();
        payload = {
          type: type,
          code: `${type}_${timestamp}`,
          libelle: typeInfo?.label || type,
          actif: actif
        };
        console.log('CRÉATION - Payload généré:', payload);
      } else {
        // Pour modification: garder les valeurs existantes
        const code = this.data.nomenclature?.code || `${type}_${Date.now()}`;
        const libelle = this.data.nomenclature?.libelle || typeInfo?.label || type;
        
        payload = {
          type: type,
          code: code,
          libelle: libelle,
          actif: actif
        };
        console.log('MODIFICATION - Code:', code);
        console.log('MODIFICATION - Libellé:', libelle);
        console.log('MODIFICATION - Payload généré:', payload);
      }

      console.log('=== ENVOI PAYLOAD FINAL ===', payload);

      const operation = this.isEditMode
        ? this.nomenclatureService.updateNomenclature(this.data.nomenclature!.id!, payload)
        : this.nomenclatureService.createNomenclature(payload);

      operation.subscribe({
        next: (result) => {
          this.loading = false;
          this.snackBar.open(
            this.isEditMode ? 'Nomenclature modifiée avec succès ✅' : 'Nomenclature créée avec succès ✅',
            'Fermer',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur complète:', error);
          console.error('Message erreur:', error.error);
          this.snackBar.open(
            error.error?.message || error.message || 'Erreur lors de l\'enregistrement ❌',
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
