import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  Nomenclature, 
  NomenclatureDto, 
  NomenclatureType,
  NomenclatureGroup 
} from '../models/nomenclature.model';

// Ré-exporter pour compatibilité avec les anciens imports
export { Nomenclature, NomenclatureDto, NomenclatureType, NomenclatureGroup } from '../models/nomenclature.model';

/**
 * Service de gestion des nomenclatures
 */
@Injectable({ providedIn: 'root' })
export class NomenclatureService {
  private apiUrl = `${environment.apiUrl}/nomenclatures`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les nomenclatures
   */
  getAllNomenclatures(): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(this.apiUrl);
  }

  /**
   * Récupérer une nomenclature par ID
   */
  getNomenclatureById(id: string): Observable<Nomenclature> {
    return this.http.get<Nomenclature>(`${this.apiUrl}/${id}`);
  }

  /**
   * Alias pour getNomenclatureById (compatibilité)
   */
  getById(id: string): Observable<Nomenclature> {
    return this.getNomenclatureById(id);
  }

  /**
   * Alias pour getAllNomenclatures (compatibilité)
   */
  getNomenclatures(): Observable<Nomenclature[]> {
    return this.getAllNomenclatures();
  }

  /**
   * Récupérer les nomenclatures par type
   */
  getNomenclaturesByType(type: NomenclatureType): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(`${this.apiUrl}/type/${type}`);
  }

  /**
   * Récupérer tous les types
   */
  getAllTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`);
  }

  /**
   * Créer une nomenclature
   */
  createNomenclature(nomenclature: NomenclatureDto): Observable<Nomenclature> {
    return this.http.post<Nomenclature>(this.apiUrl, nomenclature);
  }

  /**
   * Mettre à jour une nomenclature
   */
  updateNomenclature(id: string, nomenclature: NomenclatureDto): Observable<Nomenclature> {
    return this.http.put<Nomenclature>(`${this.apiUrl}/${id}`, nomenclature);
  }

  /**
   * Supprimer une nomenclature
   */
  deleteNomenclature(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Compter les nomenclatures
   */
  countNomenclatures(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  /**
   * Compter par type
   */
  countByType(type: NomenclatureType): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/type/${type}`);
  }

  /**
   * Initialiser les nomenclatures par défaut
   */
  initializeDefaults(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/init-defaults`, {});
  }

  /**
   * Grouper les nomenclatures par type
   */
  getNomenclaturesGroupedByType(): Observable<NomenclatureGroup[]> {
    return this.getAllNomenclatures().pipe(
      map(nomenclatures => {
        const grouped = new Map<NomenclatureType, Nomenclature[]>();
        
        nomenclatures.forEach(nom => {
          if (!grouped.has(nom.type)) {
            grouped.set(nom.type, []);
          }
          grouped.get(nom.type)!.push(nom);
        });

        return Array.from(grouped.entries()).map(([type, items]) => ({
          type,
          items: items.sort((a, b) => (a.ordre || 0) - (b.ordre || 0)),
          count: items.length
        }));
      })
    );
  }

  /**
   * Obtenir le libellé du type
   */
  getTypeLabel(type: NomenclatureType): string {
    const labels: { [key: string]: string } = {
      'TYPE_FICHE': 'Types de Fiches',
      'STATUT': 'Statuts',
      'CATEGORIE_PROJET': 'Catégories de Projets',
      'PRIORITE': 'Priorités'
    };
    return labels[type] || type;
  }

  /**
   * Obtenir l'icône du type
   */
  getTypeIcon(type: NomenclatureType): string {
    const icons: { [key: string]: string } = {
      'TYPE_FICHE': 'description',
      'STATUT': 'flag',
      'CATEGORIE_PROJET': 'category',
      'PRIORITE': 'priority_high'
    };
    return icons[type] || 'label';
  }
}