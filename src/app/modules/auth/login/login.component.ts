import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/authentification.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Redirection automatique si déjà connecté
    if (this.authService.isLoggedIn()) {
      const roleRaw = this.authService.getRole();
      const role = (roleRaw || '').replace(/^ROLE_/, '');
      
      if (role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'PILOTE_QUALITE') {
        this.router.navigate(['/fiche-suivi/dashboard']);
      } else if (role === 'CHEF_PROJET') {
        this.router.navigate(['/fiche-qualite/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;

    this.authService.login(email!, password!).subscribe({
      next: () => {
        const roleRaw = this.authService.getRole();
        const role = (roleRaw || '').replace(/^ROLE_/, '');
        
        console.log('=== LOGIN RÉUSSI ===');
        console.log('Rôle brut:', roleRaw);
        console.log('Rôle nettoyé:', role);
        
        this.snackBar.open('Connexion réussie !', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-success'] });
        
        if (role === 'ADMIN') {
          console.log('Redirection vers: /admin/dashboard');
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'PILOTE_QUALITE') {
          console.log('Redirection vers: /fiche-suivi/dashboard');
          this.router.navigate(['/fiche-suivi/dashboard']);
        } else if (role === 'CHEF_PROJET') {
          console.log('Redirection vers: /fiche-qualite/dashboard');
          this.router.navigate(['/fiche-qualite/dashboard']);
        } else {
          console.log('Rôle inconnu, redirection vers: /');
          this.router.navigate(['/']);
        }
      },
      error: err => {
        console.error('Erreur de connexion :', err);
        this.error = 'Email ou mot de passe incorrect';
        this.loading = false;
      }
    });
  }
}
