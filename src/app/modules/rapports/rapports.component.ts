import { Component, OnInit } from '@angular/core';
import { ExportService } from '../../services/export.service';
import { AiChartsService } from '../../services/ai-charts.service';

@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent implements OnInit {
  reports: any[] = [];
  loading = false;
  selectedReport: any = null;

  constructor(
    private exportService: ExportService,
    private aiChartsService: AiChartsService
  ) { }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    // Simuler le chargement des rapports
    setTimeout(() => {
      this.reports = [
        {
          id: '1',
          title: 'Rapport Mensuel Qualité',
          description: 'Analyse complète des indicateurs qualité du mois',
          type: 'MENSUEL',
          date: new Date(),
          status: 'GÉNÉRÉ'
        },
        {
          id: '2',
          title: 'Rapport IA - Prédictions',
          description: 'Analyses prédictives et recommandations IA',
          type: 'IA',
          date: new Date(Date.now() - 86400000),
          status: 'EN COURS'
        },
        {
          id: '3',
          title: 'Rapport Trimestriel',
          description: 'Bilan trimestriel des processus qualité',
          type: 'TRIMESTRIEL',
          date: new Date(Date.now() - 2592000000),
          status: 'GÉNÉRÉ'
        }
      ];
      this.loading = false;
    }, 1000);
  }

  generateReport(type: string) {
    this.loading = true;
    
    setTimeout(() => {
      const newReport = {
        id: Date.now().toString(),
        title: `Rapport ${type} - ${new Date().toLocaleDateString('fr-FR')}`,
        description: `Rapport ${type.toLowerCase()} généré automatiquement`,
        type: type,
        date: new Date(),
        status: 'GÉNÉRÉ'
      };
      
      this.reports.unshift(newReport);
      this.loading = false;
    }, 2000);
  }

  exportToPDF(report: any) {
    const chartData = {
      scoreIA: 85,
      confiance: 92,
      alertes: 1
    };
    
    this.exportService.exportChartsToPDF(chartData, `rapport-${report.id}.pdf`);
  }

  exportToExcel(report: any) {
    const data = [
      { 'Indicateur': 'Taux de Conformité', 'Valeur': '78%', 'Objectif': '90%' },
      { 'Indicateur': 'Efficacité', 'Valeur': '85%', 'Objectif': '95%' },
      { 'Indicateur': 'Satisfaction', 'Valeur': '92%', 'Objectif': '88%' }
    ];
    
    this.exportService.exportDataToExcel(data, `rapport-${report.id}.xlsx`);
  }

  getReportIcon(type: string): string {
    switch (type) {
      case 'MENSUEL': return 'calendar_month';
      case 'IA': return 'psychology';
      case 'TRIMESTRIEL': return 'assessment';
      default: return 'description';
    }
  }

  getReportColor(type: string): string {
    switch (type) {
      case 'MENSUEL': return 'primary';
      case 'IA': return 'accent';
      case 'TRIMESTRIEL': return 'warn';
      default: return 'primary';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'GÉNÉRÉ': return 'success';
      case 'EN COURS': return 'warning';
      case 'ERREUR': return 'error';
      default: return 'primary';
    }
  }
} 