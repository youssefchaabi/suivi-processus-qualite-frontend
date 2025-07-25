import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/authentification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getRole();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    if (expectedRole) {
      if (Array.isArray(expectedRole)) {
        if (!expectedRole.includes(userRole)) {
          this.snackBar.open('Accès refusé : rôle insuffisant.', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-error'] });
          this.router.navigate(['/unauthorized']);
          return false;
        }
      } else {
        if (userRole !== expectedRole) {
          this.snackBar.open('Accès refusé : rôle insuffisant.', 'Fermer', { duration: 2000, panelClass: ['mat-snack-bar-error'] });
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
    }
    return true;
  }
}
