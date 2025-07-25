import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string; // email
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(this.apiUrl, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
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
}
