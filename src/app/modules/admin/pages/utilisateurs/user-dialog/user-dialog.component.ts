import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../../models/user.model';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean;
  hidePassword = true;

  roles = [
    { value: 'ADMIN', label: 'Administrateur', icon: 'admin_panel_settings', color: 'warn' },
    { value: 'CHEF_PROJET', label: 'Chef de Projet', icon: 'engineering', color: 'accent' },
    { value: 'PILOTE_QUALITE', label: 'Pilote Qualité', icon: 'verified_user', color: 'primary' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', user?: User }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      this.userForm.patchValue(this.data.user);
      // En mode édition, le mot de passe n'est pas requis
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: [
        this.isEditMode ? '' : 'TempPass123!', 
        this.isEditMode ? [] : [
          Validators.required, 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        ]
      ],
      role: ['CHEF_PROJET', Validators.required],
      telephone: ['', [
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      actif: [true]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = { ...this.userForm.value };
      
      // Ne pas envoyer le password en mode édition s'il est vide
      if (this.isEditMode && !formValue.password) {
        delete formValue.password;
      }

      this.dialogRef.close(formValue);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Ce champ est obligatoire';
    }
    if (control.errors['email']) {
      return 'Email invalide';
    }
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    }
    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;
    }
    if (control.errors['pattern']) {
      if (fieldName === 'telephone') {
        return 'Format: 10 chiffres';
      }
      if (fieldName === 'password') {
        return 'Le mot de passe doit contenir: majuscule, minuscule, chiffre et caractère spécial';
      }
    }
    return 'Champ invalide';
  }

  getRoleIcon(roleValue: string): string {
    return this.roles.find(r => r.value === roleValue)?.icon || 'person';
  }
}
