import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PredictionRisque {
  niveau: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' | 'CRITIQUE';
  probabilite: number;
  description: string;
  recommandations: string[];
  impact: string;
}

export interface RecommandationIA {
  type: 'URGENT' | 'IMPORTANT' | 'SUGGESTION';
  titre: string;
  description: string;
  priorite: number;
  actions: string[];
  impactAttendu: string;
  delaiEstime: string;
}

export interface AnalyseTendance {
  periode: string;
  tendance: 'HAUSSE' | 'STABLE' | 'BAISSE';
  valeur: number;
  variation: number;
  explication: string;
}

export interface OptimisationProcessus {
  processus: string;
  efficaciteActuelle: number;
  efficaciteOptimale: number;
  gainsPotentiels: string[];
  actionsOptimisation: string[];
  delaiImplementation: string;
}

export interface DashboardIAData {
  risques: {
    predictions: PredictionRisque[];
    tauxConformite: number;
    fichesEnRetard: number;
  };
  recommandations: {
    recommandations: RecommandationIA[];
    totalFiches: number;
    tauxConformite: number;
  };
  tendances: {
    tendances: AnalyseTendance[];
    totalFiches: number;
    tauxConformite: number;
  };
  optimisations: {
    optimisations: OptimisationProcessus[];
    efficaciteActuelle: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiAnalyticsApiService {

  private baseUrl = environment.apiUrl + '/ai-analytics';

  constructor(private http: HttpClient) { }

  // Analyser les risques
  analyserRisques(): Observable<any> {
    return this.http.get(`${this.baseUrl}/risques`);
  }

  // Générer des recommandations
  genererRecommandations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recommandations`);
  }

  // Analyser les tendances
  analyserTendances(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tendances`);
  }

  // Optimiser les processus
  optimiserProcessus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/optimisations`);
  }

  // Générer un rapport IA complet
  genererRapportIA(): Observable<any> {
    return this.http.get(`${this.baseUrl}/rapport`);
  }

  // Récupérer toutes les données du dashboard IA
  getDashboardData(): Observable<DashboardIAData> {
    return this.http.get<DashboardIAData>(`${this.baseUrl}/dashboard`);
  }
} 