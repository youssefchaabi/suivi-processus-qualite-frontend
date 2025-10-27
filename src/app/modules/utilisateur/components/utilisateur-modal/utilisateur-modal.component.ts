import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Utilisateur, UtilisateurService } from 'src/app/services/utilisateur.service';

@Component({
  selector: 'app-utilisateur-modal',
  templateUrl: './utilisateur-modal.component.html',
  styleUrls: ['./utilisateur-modal.component.scss']
})
export class UtilisateurModalComponent implements OnInit {
  utilisateurForm!: FormGroup;
  loading = false;
  isEditMode = false;
  hidePassword = true;

  roles = [
    { value: 'ADMIN', label: 'Administrateur', icon: 'admin_panel_settings', color: '#e74c3c' },
    { value: 'CHEF_PROJET', label: 'Chef de Projet', icon: 'engineering', color: '#3498db' },
    { value: 'PILOTE_QUALITE', label: 'Pilote Qualité', icon: 'science', color: '#2ecc71' }
  ];

  constructor(
    public dialogRef: MatDialogRef<UtilisateurModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { utilisateur?: Utilisateur },
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.utilisateur;
    this.initForm();
  }

  initForm(): void {
    if (this.isEditMode) {
      this.utilisateurForm = this.fb.group({
        nom: [this.data.utilisateur?.nom || '', Validators.required],
        email: [this.data.utilisateur?.email || '', [Validators.required, Validators.email]],
        role: [this.data.utilisateur?.role || '', Validators.required]
      });
    } else {
      this.utilisateurForm = this.fb.group({
        nom: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        role: ['', Validators.required]
      });
    }
  }

  getSelectedRoleInfo() {
    const role = this.utilisateurForm.get('role')?.value;
    return this.roles.find(r => r.value === role);
  }

  onSubmit(): void {
    if (this.utilisateurForm.valid) {
      this.loading = true;
      const formData = { ...this.utilisateurForm.value };

      console.log('Envoi utilisateur:', { ...formData, password: formData.password ? '***' : undefined });

      const operation = this.isEditMode
        ? this.utilisateurService.updateUtilisateur(this.data.utilisateur!.id!, formData)
        : this.utilisateurService.createUtilisateur(formData);

      // Timeout de sécurité pour éviter blocage infini
      const timeoutId = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.snackBar.open(
            'La requête prend trop de temps. Veuillez réessayer.',
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      }, 30000); // 30 secondes max

      operation.subscribe({
        next: (result) => {
          clearTimeout(timeoutId);
          this.loading = false;
          this.snackBar.open(
            this.isEditMode ? 'Utilisateur modifié avec succès ✅' : 'Utilisateur créé avec succès ✅',
            'Fermer',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.dialogRef.close(result);
        },
        error: (error) => {
          clearTimeout(timeoutId);
          this.loading = false;
          console.error('Erreur complète:', error);
          console.error('Statut:', error.status);
          console.error('Message:', error.error);
          
          let errorMessage = 'Erreur lors de l\'enregistrement ❌';
          if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
