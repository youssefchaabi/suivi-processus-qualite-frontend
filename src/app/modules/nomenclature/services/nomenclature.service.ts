import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nomenclature } from '../models/nomenclature.model';

@Injectable({
  providedIn: 'root'
})
export class NomenclatureService {
  private apiUrl = 'http://localhost:8080/api/nomenclatures';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Nomenclature[]> {
    return this.http.get<Nomenclature[]>(this.apiUrl);
  }

  getById(id: string): Observable<Nomenclature> {
    return this.http.get<Nomenclature>(`${this.apiUrl}/${id}`);
  }

  create(nomenclature: Nomenclature): Observable<Nomenclature> {
    return this.http.post<Nomenclature>(this.apiUrl, nomenclature);
  }

  update(id: string, nomenclature: Nomenclature): Observable<Nomenclature> {
    return this.http.put<Nomenclature>(`${this.apiUrl}/${id}`, nomenclature);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
