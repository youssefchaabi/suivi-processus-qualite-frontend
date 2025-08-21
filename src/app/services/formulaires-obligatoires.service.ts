import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FormulaireObligatoire {
  id?: string;
  nom: string;
  description: string;
  typeFormulaire: 'QUALITE' | 'SUIVI' | 'AUDIT' | 'CONTROLE';
  responsableId: string;
  dateEcheance: Date;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
  statut: 'EN_ATTENTE' | 'SOUMIS' | 'EN_RETARD' | 'ANNULE';
  notifie: boolean;
  commentaires?: string;
  dateCreation?: Date;
  dateModification?: Date;
}

export interface FiltresFormulaires {
  statut?: string;
  priorite?: string;
  responsableId?: string;
  typeFormulaire?: string;
  dateDebut?: Date;
  dateFin?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FormulairesObligatoiresService {

  private apiUrl = `${environment.apiUrl}/formulaires-obligatoires`;

  constructor(private http: HttpClient) { }

  /**
   * Récupérer tous les formulaires obligatoires
   */
  getAllFormulaires(): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(this.apiUrl);
  }

  /**
   * Récupérer un formulaire par ID
   */
  getFormulaireById(id: string): Observable<FormulaireObligatoire> {
    return this.http.get<FormulaireObligatoire>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau formulaire
   */
  createFormulaire(formulaire: FormulaireObligatoire): Observable<FormulaireObligatoire> {
    return this.http.post<FormulaireObligatoire>(this.apiUrl, formulaire);
  }

  /**
   * Mettre à jour un formulaire
   */
  updateFormulaire(id: string, formulaire: FormulaireObligatoire): Observable<FormulaireObligatoire> {
    return this.http.put<FormulaireObligatoire>(`${this.apiUrl}/${id}`, formulaire);
  }

  /**
   * Supprimer un formulaire
   */
  deleteFormulaire(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  /**
   * Marquer un formulaire comme soumis
   */
  marquerSoumis(id: string): Observable<FormulaireObligatoire> {
    return this.http.patch<FormulaireObligatoire>(`${this.apiUrl}/${id}/soumis`, {});
  }

  /**
   * Marquer un formulaire comme en retard
   */
  marquerEnRetard(id: string): Observable<FormulaireObligatoire> {
    return this.http.patch<FormulaireObligatoire>(`${this.apiUrl}/${id}/retard`, {});
  }

  /**
   * Annuler un formulaire
   */
  annulerFormulaire(id: string, raison: string): Observable<FormulaireObligatoire> {
    return this.http.patch<FormulaireObligatoire>(`${this.apiUrl}/${id}/annuler`, { raison });
  }

  /**
   * Récupérer les formulaires avec filtres
   */
  getFormulairesWithFilters(filtres: FiltresFormulaires): Observable<FormulaireObligatoire[]> {
    return this.http.post<FormulaireObligatoire[]>(`${this.apiUrl}/filtres`, filtres);
  }

  /**
   * Récupérer les formulaires par statut
   */
  getFormulairesByStatut(statut: string): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(`${this.apiUrl}/statut/${statut}`);
  }

  /**
   * Récupérer les formulaires par priorité
   */
  getFormulairesByPriorite(priorite: string): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(`${this.apiUrl}/priorite/${priorite}`);
  }

  /**
   * Récupérer les formulaires par responsable
   */
  getFormulairesByResponsable(responsableId: string): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(`${this.apiUrl}/responsable/${responsableId}`);
  }

  /**
   * Récupérer les formulaires par type
   */
  getFormulairesByType(type: string): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(`${this.apiUrl}/type/${type}`);
  }

  /**
   * Récupérer les formulaires en retard
   */
  getFormulairesEnRetard(): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(`${this.apiUrl}/retard`);
  }

  /**
   * Récupérer les formulaires avec échéance proche
   */
  getFormulairesEcheanceProche(): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(`${this.apiUrl}/echeance-proche`);
  }

  /**
   * Récupérer les formulaires soumis
   */
  getFormulairesSoumis(): Observable<FormulaireObligatoire[]> {
    return this.http.get<FormulaireObligatoire[]>(`${this.apiUrl}/soumis`);
  }

  /**
   * Obtenir les statistiques des formulaires
   */
  getFormulairesStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  /**
   * Obtenir le nombre total de formulaires
   */
  getTotalFormulaires(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total`);
  }

  /**
   * Obtenir le nombre de formulaires en retard
   */
  getFormulairesEnRetardCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/retard`);
  }

  /**
   * Obtenir le nombre de formulaires avec échéance proche
   */
  getFormulairesEcheanceProcheCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/echeance-proche`);
  }

  /**
   * Obtenir le nombre de formulaires soumis
   */
  getFormulairesSoumisCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/soumis`);
  }

  /**
   * Vérifier et notifier les retards
   */
  verifierEtNotifierRetards(): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/verifier-retards`, {});
  }

  /**
   * Vérifier les échéances proches
   */
  verifierEcheancesProches(): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/verifier-echeances`, {});
  }

  /**
   * Exporter les formulaires
   */
  exportFormulaires(filtres?: FiltresFormulaires): Observable<Blob> {
    const options = { responseType: 'blob' as 'json' };
    if (filtres) {
      return this.http.post<Blob>(`${this.apiUrl}/export`, filtres, options);
    }
    return this.http.get<Blob>(`${this.apiUrl}/export`, options);
  }

  /**
   * Importer des formulaires
   */
  importFormulaires(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.apiUrl}/import`, formData);
  }

  /**
   * Dupliquer un formulaire
   */
  dupliquerFormulaire(id: string): Observable<FormulaireObligatoire> {
    return this.http.post<FormulaireObligatoire>(`${this.apiUrl}/${id}/dupliquer`, {});
  }

  /**
   * Archiver un formulaire
   */
  archiverFormulaire(id: string): Observable<FormulaireObligatoire> {
    return this.http.patch<FormulaireObligatoire>(`${this.apiUrl}/${id}/archiver`, {});
  }

  /**
   * Restaurer un formulaire archivé
   */
  restaurerFormulaire(id: string): Observable<FormulaireObligatoire> {
    return this.http.patch<FormulaireObligatoire>(`${this.apiUrl}/${id}/restaurer`, {});
  }

  /**
   * Ajouter un commentaire à un formulaire
   */
  ajouterCommentaire(id: string, commentaire: string): Observable<FormulaireObligatoire> {
    return this.http.post<FormulaireObligatoire>(`${this.apiUrl}/${id}/commentaires`, { commentaire });
  }

  /**
   * Obtenir l'historique d'un formulaire
   */
  getHistoriqueFormulaire(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/historique`);
  }
} 