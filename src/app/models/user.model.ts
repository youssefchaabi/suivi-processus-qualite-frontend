/**
 * Modèle Utilisateur
 */
export interface User {
  id?: string;
  nom: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'CHEF_PROJET' | 'PILOTE_QUALITE';
  actif: boolean;
  telephone?: string;
  dateCreation?: string;
  dateModification?: string;
  creePar?: string;
}

/**
 * DTO pour la création d'utilisateur
 */
export interface CreateUserDto {
  nom: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'CHEF_PROJET' | 'PILOTE_QUALITE';
  telephone?: string;
}

/**
 * DTO pour la mise à jour d'utilisateur
 */
export interface UpdateUserDto {
  nom?: string;
  email?: string;
  role?: 'ADMIN' | 'CHEF_PROJET' | 'PILOTE_QUALITE';
  telephone?: string;
  actif?: boolean;
}

/**
 * Statistiques utilisateurs
 */
export interface UserStats {
  total: number;
  actifs: number;
  admins: number;
  chefsProjet: number;
  pilotesQualite: number;
}

/**
 * Réponse reset password
 */
export interface ResetPasswordResponse {
  message: string;
  nouveauMotDePasse: string;
}
