import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  User, 
  CreateUserDto, 
  UpdateUserDto, 
  UserStats, 
  ResetPasswordResponse 
} from '../models/user.model';

/**
 * Service de gestion des utilisateurs
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Récupérer un utilisateur par ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouvel utilisateur
   */
  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(id: string, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Activer/Désactiver un utilisateur
   */
  toggleUserStatus(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle`, {});
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(id: string): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.apiUrl}/${id}/reset-password`, 
      {}
    );
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques
   */
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Obtenir le libellé du rôle
   */
  getRoleLabel(role: string): string {
    const roles: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'CHEF_PROJET': 'Chef de Projet',
      'PILOTE_QUALITE': 'Pilote Qualité'
    };
    return roles[role] || role;
  }

  /**
   * Obtenir la couleur du rôle
   */
  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': 'primary',
      'CHEF_PROJET': 'accent',
      'PILOTE_QUALITE': 'warn'
    };
    return colors[role] || 'primary';
  }
}
