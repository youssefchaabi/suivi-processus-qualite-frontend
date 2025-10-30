import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string; // email
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(this.apiUrl, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    // Ne pas naviguer ici, laisser le composant gérer la navigation
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      localStorage.removeItem('token');
      return false;
    }
    return true;
  }

  // ✅ Méthode pour extraire le rôle depuis le token JWT
  getRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
      try {
      const decoded: any = jwtDecode(token);
      // Adapte la clé selon la structure de ton JWT
      return decoded.role || decoded.roles || null;
    } catch (e) {
        return null;
      }
    }

  // ✅ Méthode pour extraire l'ID utilisateur depuis le token JWT
  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.userId || null;
    } catch (e) {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
  isChefProjet(): boolean {
    return this.getRole() === 'CHEF_PROJET';
  }
  isPiloteQualite(): boolean {
    return this.getRole() === 'PILOTE_QUALITE';
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded || !decoded.exp) return true;
      const nowSeconds = Math.floor(Date.now() / 1000);
      return decoded.exp < nowSeconds;
    } catch {
      return true;
    }
  }
}
