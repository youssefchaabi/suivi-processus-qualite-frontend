import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { AiChartsService, ChartData } from '../../services/ai-charts.service';
import { ExportService } from '../../services/export.service';

// Enregistrer tous les composants Chart.js nécessaires
Chart.register(...registerables);

@Component({
  selector: 'app-ai-charts',
  templateUrl: './ai-charts.component.html',
  styleUrls: ['./ai-charts.component.scss']
})
export class AiChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('predictionChart') predictionChartRef!: ElementRef;
  @ViewChild('kpiChart') kpiChartRef!: ElementRef;

  public trendChart!: Chart;
  public predictionChart!: Chart;
  public kpiChart!: Chart;

  constructor(
    private aiChartsService: AiChartsService,
    private exportService: ExportService
  ) {
    console.log('AiChartsComponent constructor called');
  }

  ngOnInit() {
    console.log('AiChartsComponent ngOnInit called');
  }

  ngAfterViewInit() {
    console.log('AiChartsComponent ngAfterViewInit called');
    // Créer les graphiques immédiatement avec des données par défaut
    setTimeout(() => {
      console.log('Creating charts after timeout...');
      this.createCharts();
    }, 100);
  }

  private createCharts() {
    console.log('Creating all charts...');
    this.createTrendChart();
    this.createPredictionChart();
    this.createKpiChart();
  }

  private createTrendChart() {
    const ctx = this.trendChartRef?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found for trend chart');
      return;
    }
    console.log('Creating trend chart...');

    // Données par défaut pour le graphique de tendance
    const chartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
      datasets: [{
        label: 'Taux de Conformité (%)',
        data: [85, 82, 78, 75, 72, 70, 68, 65],
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Objectif (%)',
        data: [90, 90, 90, 90, 90, 90, 90, 90],
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderDash: [5, 5],
        tension: 0.4
      }]
    };

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Évolution du Taux de Conformité',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    console.log('Trend chart created successfully');
  }

  private createPredictionChart() {
    const ctx = this.predictionChartRef?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found for prediction chart');
      return;
    }
    console.log('Creating prediction chart...');

    // Données par défaut pour le graphique de prédiction
    const chartData = {
      labels: ['Risque Élevé', 'Risque Moyen', 'Risque Faible', 'Sécurisé'],
      datasets: [{
        label: 'Probabilité (%)',
        data: [25, 35, 30, 10],
        backgroundColor: [
          '#ff6384',
          '#ffa726',
          '#4bc0c0',
          '#36a2eb'
        ],
        borderColor: [
          '#ff6384',
          '#ffa726',
          '#4bc0c0',
          '#36a2eb'
        ],
        borderWidth: 2
      }]
    };

    this.predictionChart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Analyse Prédictive des Risques',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    console.log('Prediction chart created successfully');
  }

  private createKpiChart() {
    const ctx = this.kpiChartRef?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found for KPI chart');
      return;
    }
    console.log('Creating KPI chart...');

    // Données par défaut pour le graphique KPI
    const chartData = {
      labels: ['Conformité', 'Efficacité', 'Satisfaction', 'Innovation'],
      datasets: [{
        label: 'KPI Qualité',
        data: [78, 85, 92, 65],
        backgroundColor: [
          '#ff6384',
          '#36a2eb',
          '#4bc0c0',
          '#ffa726'
        ],
        borderColor: [
          '#ff6384',
          '#36a2eb',
          '#4bc0c0',
          '#ffa726'
        ],
        borderWidth: 2
      }]
    };

    this.kpiChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Répartition des KPI Qualité',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    console.log('KPI chart created successfully');
  }

  // Méthodes pour les contrôles interactifs
  onPeriodChange(event: any) {
    const period = parseInt(event.target.value);
    console.log('Period changed to:', period);
    // Ici vous pouvez recharger les données avec la nouvelle période
  }

  onChartTypeChange(event: any) {
    const chartType = event.target.value;
    console.log('Chart type changed to:', chartType);
    // Ici vous pouvez changer le type de graphique
  }

  refreshCharts() {
    console.log('Refreshing charts...');
    // Recharger les données et mettre à jour les graphiques
    this.loadChartData();
  }

  private loadChartData() {
    // Charger les données depuis le service (optionnel)
    this.aiChartsService.getTrendData().subscribe(data => {
      console.log('Trend data loaded:', data);
    });

    this.aiChartsService.getPredictionData().subscribe(data => {
      console.log('Prediction data loaded:', data);
    });

    this.aiChartsService.getKpiData().subscribe(data => {
      console.log('KPI data loaded:', data);
    });
  }

  // Méthodes d'export
  exportToPDF() {
    const chartData = {
      scoreIA: 85,
      confiance: 92,
      alertes: 1
    };
    this.exportService.exportChartsToPDF(chartData, 'graphiques-ia.pdf');
  }

  exportToExcel() {
    const data = [
      { 'Mois': 'Jan', 'Conformité': 85, 'Objectif': 90 },
      { 'Mois': 'Fév', 'Conformité': 82, 'Objectif': 90 },
      { 'Mois': 'Mar', 'Conformité': 78, 'Objectif': 90 },
      { 'Mois': 'Avr', 'Conformité': 75, 'Objectif': 90 },
      { 'Mois': 'Mai', 'Conformité': 72, 'Objectif': 90 },
      { 'Mois': 'Juin', 'Conformité': 70, 'Objectif': 90 },
      { 'Mois': 'Juil', 'Conformité': 68, 'Objectif': 90 },
      { 'Mois': 'Août', 'Conformité': 65, 'Objectif': 90 }
    ];
    this.exportService.exportDataToExcel(data, 'donnees-graphiques-ia.xlsx');
  }
} 