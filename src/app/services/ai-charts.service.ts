import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string | string[];
    backgroundColor?: string | string[];
    tension?: number;
    fill?: boolean;
    borderDash?: number[];
    borderWidth?: number;
  }[];
}

export interface TrendData {
  period: string;
  conformity: number;
  target: number;
  efficiency: number;
  satisfaction: number;
}

export interface PredictionData {
  type: string;
  riskLevel: number;
  probability: number;
  impact: string;
}

export interface KpiData {
  category: string;
  value: number;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChartsService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Récupérer les données de tendance
  getTrendData(period: number = 8): Observable<ChartData> {
    return this.http.get<any>(`${this.apiUrl}/ai-charts/trends?period=${period}`).pipe(
      map(data => this.transformBackendData(data)),
      catchError(() => this.getMockTrendData())
    );
  }

  // Récupérer les données de prédiction
  getPredictionData(): Observable<ChartData> {
    return this.http.get<any>(`${this.apiUrl}/ai-charts/predictions`).pipe(
      map(data => this.transformBackendData(data)),
      catchError(() => this.getMockPredictionData())
    );
  }

  // Récupérer les données KPI
  getKpiData(): Observable<ChartData> {
    return this.http.get<any>(`${this.apiUrl}/ai-charts/kpi`).pipe(
      map(data => this.transformBackendData(data)),
      catchError(() => this.getMockKpiData())
    );
  }

  // Transformer les données de tendance
  private transformTrendData(data: TrendData[]): ChartData {
    const labels = data.map(item => item.period);
    const conformityData = data.map(item => item.conformity);
    const targetData = data.map(() => 90); // Objectif constant

    return {
      labels,
      datasets: [
        {
          label: 'Taux de Conformité (%)',
          data: conformityData,
          borderColor: '#ff6384',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Objectif (%)',
          data: targetData,
          borderColor: '#36a2eb',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };
  }

  // Transformer les données de prédiction
  private transformPredictionData(data: PredictionData[]): ChartData {
    const labels = data.map(item => item.type);
    const riskData = data.map(item => item.riskLevel);

    return {
      labels,
      datasets: [{
        label: 'Risque Prédit (%)',
        data: riskData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 2
      }]
    };
  }

  // Transformer les données KPI
  private transformKpiData(data: KpiData[]): ChartData {
    const labels = data.map(item => item.category);
    const values = data.map(item => item.value);
    const colors = data.map(item => item.color);

    return {
      labels,
      datasets: [{
        label: 'KPI Qualité',
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  // Données mock pour les tests
  private getMockTrendData(): Observable<ChartData> {
    const mockData: ChartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
      datasets: [
        {
          label: 'Taux de Conformité (%)',
          data: [85, 82, 78, 75, 72, 70, 68, 65],
          borderColor: '#ff6384',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Objectif (%)',
          data: [90, 90, 90, 90, 90, 90, 90, 90],
          borderColor: '#36a2eb',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };
    return of(mockData);
  }

  private getMockPredictionData(): Observable<ChartData> {
    const mockData: ChartData = {
      labels: ['Contrôle', 'Audit', 'Amélioration', 'Formation', 'Maintenance'],
      datasets: [{
        label: 'Risque Prédit (%)',
        data: [85, 65, 45, 30, 20],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 2
      }]
    };
    return of(mockData);
  }

  private getMockKpiData(): Observable<ChartData> {
    const mockData: ChartData = {
      labels: ['Conformité', 'Efficacité', 'Satisfaction', 'Innovation'],
      datasets: [{
        label: 'KPI Qualité',
        data: [65, 78, 85, 72],
        backgroundColor: [
          '#ff6384',
          '#36a2eb',
          '#ffce56',
          '#4bc0c0'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
    return of(mockData);
  }

  // Transformer les données du backend
  private transformBackendData(data: any): ChartData {
    return {
      labels: data.labels || [],
      datasets: data.datasets || []
    };
  }

  // Mettre à jour les données en temps réel
  refreshData(): Observable<{
    trend: ChartData;
    prediction: ChartData;
    kpi: ChartData;
  }> {
    return this.http.get(`${this.apiUrl}/ai-charts/dashboard-data`).pipe(
      map((response: any) => ({
        trend: this.transformBackendData(response.trends || {}),
        prediction: this.transformBackendData(response.predictions || {}),
        kpi: this.transformBackendData(response.kpi || {})
      })),
      catchError(() => {
        // Utiliser forkJoin pour combiner les observables
        return of({
          trend: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
            datasets: [
              {
                label: 'Taux de Conformité (%)',
                data: [85, 82, 78, 75, 72, 70, 68, 65],
                borderColor: '#ff6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Objectif (%)',
                data: [90, 90, 90, 90, 90, 90, 90, 90],
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderDash: [5, 5],
                tension: 0.4
              }
            ]
          },
          prediction: {
            labels: ['Contrôle', 'Audit', 'Amélioration', 'Formation', 'Maintenance'],
            datasets: [{
              label: 'Risque Prédit (%)',
              data: [85, 65, 45, 30, 20],
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(255, 159, 64, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(54, 162, 235, 0.8)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)'
              ],
              borderWidth: 2
            }]
          },
                     kpi: {
             labels: ['Conformité', 'Efficacité', 'Satisfaction', 'Innovation'],
             datasets: [{
               label: 'KPI Qualité',
               data: [65, 78, 85, 72],
               backgroundColor: [
                 '#ff6384',
                 '#36a2eb',
                 '#ffce56',
                 '#4bc0c0'
               ],
               borderWidth: 2,
               borderColor: '#fff'
             }]
           }
        });
      })
    );
  }
} 