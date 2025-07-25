import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Nomenclature {
  id?: string;
  type: string;
  valeur: string;
}

@Injectable({ providedIn: 'root' })
export class NomenclatureService {
  private apiUrl = 'http://localhost:8080/api/nomenclatures';

  constructor(private http: HttpClient) {}

  getNomenclatures(): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(this.apiUrl);
  }

  getNomenclaturesByType(type: string): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(`${this.apiUrl}/type/${type}`);
  }

  createNomenclature(nom: Nomenclature): Observable<Nomenclature> {
    return this.http.post<Nomenclature>(this.apiUrl, nom);
  }

  updateNomenclature(id: string, nom: Nomenclature): Observable<Nomenclature> {
    return this.http.put<Nomenclature>(`${this.apiUrl}/${id}`, nom);
  }

  deleteNomenclature(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 