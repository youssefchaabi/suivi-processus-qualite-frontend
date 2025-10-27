import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  loading = false;
  roleInfo: any;

  roleData: any = {
    'ADMIN': {
      title: 'Administrateur',
      icon: 'admin_panel_settings',
      color: '#e74c3c',
      colorLight: '#ec7063',
      description: 'Accès complet au système'
    },
    'CHEF_PROJET': {
      title: 'Chef de Projet',
      icon: 'engineering',
      color: '#3498db',
      colorLight: '#5dade2',
      description: 'Gestion des projets qualité'
    },
    'PILOTE_QUALITE': {
      title: 'Pilote Qualité',
      icon: 'science',
      color: '#2ecc71',
      colorLight: '#58d68d',
      description: 'Suivi des KPI et analyses'
    }
  };

  constructor(
    public dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { role: string },
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.roleInfo = this.roleData[this.data.role];
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.loading = false;
          
          // Récupérer le rôle depuis le token décodé et nettoyer le préfixe ROLE_
          const userRoleRaw = this.authService.getRole();
          const userRole = (userRoleRaw || '').replace(/^ROLE_/, '');
          
          console.log('=== LOGIN MODAL ===');
          console.log('Rôle brut:', userRoleRaw);
          console.log('Rôle nettoyé:', userRole);
          console.log('Rôle attendu:', this.data.role);
          
          // Vérifier si le rôle correspond
          if (userRole === this.data.role) {
            this.snackBar.open('Connexion réussie ! 🎉', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(true);
            
            // Rediriger selon le rôle
            this.redirectByRole(userRole);
          } else {
            // Déconnecter si le rôle ne correspond pas
            this.authService.logout();
            this.snackBar.open('Ce compte n\'a pas le rôle ' + this.roleInfo.title, 'Fermer', {
              duration: 4000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Email ou mot de passe incorrect ❌', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  redirectByRole(role: string): void {
    console.log('=== REDIRECTION PAR RÔLE ===');
    console.log('Rôle:', role);
    
    switch (role) {
      case 'ADMIN':
        console.log('Redirection vers: /admin/dashboard');
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CHEF_PROJET':
        console.log('Redirection vers: /fiche-qualite/dashboard');
        this.router.navigate(['/fiche-qualite/dashboard']);
        break;
      case 'PILOTE_QUALITE':
        console.log('Redirection vers: /fiche-suivi/dashboard');
        this.router.navigate(['/fiche-suivi/dashboard']);
        break;
      default:
        console.log('Rôle inconnu, redirection vers: /');
        this.router.navigate(['/']);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
