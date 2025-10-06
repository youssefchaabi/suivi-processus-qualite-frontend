import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  // Exporter les graphiques en PDF
  exportChartsToPDF(data: any, filename: string = 'dashboard-ia.pdf'): void {
    const doc = new jsPDF();
    
    // Titre principal
    doc.setFontSize(20);
    doc.text('Dashboard IA - Rapport Qualité', 20, 20);
    
    // Date de génération
    doc.setFontSize(12);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
    
    // Métriques principales
    doc.setFontSize(16);
    doc.text('Métriques Principales', 20, 55);
    
    doc.setFontSize(12);
    let yPosition = 70;
    
    if (data.scoreIA !== undefined) {
      doc.text(`Score IA: ${data.scoreIA.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.confiance !== undefined) {
      doc.text(`Niveau de Confiance: ${data.confiance.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.tauxConformite !== undefined) {
      doc.text(`Taux de Conformité: ${data.tauxConformite.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.efficacite !== undefined) {
      doc.text(`Efficacité Processus: ${data.efficacite.toFixed(1)}%`, 20, yPosition);
      yPosition += 10;
    }
    
    // Alertes et statistiques
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Alertes et Statistiques', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    
    if (data.alertes !== undefined) {
      doc.text(`Alertes Critiques: ${data.alertes}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.fichesEnRetard !== undefined) {
      doc.text(`Fiches en Retard: ${data.fichesEnRetard}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.fichesBloquees !== undefined) {
      doc.text(`Fiches Bloquées: ${data.fichesBloquees}`, 20, yPosition);
      yPosition += 10;
    }
    
    // Analyses IA
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Analyses IA', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    
    if (data.predictions !== undefined) {
      doc.text(`Prédictions de Risques: ${data.predictions}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.recommandations !== undefined) {
      doc.text(`Recommandations IA: ${data.recommandations}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (data.optimisations !== undefined) {
      doc.text(`Optimisations: ${data.optimisations}`, 20, yPosition);
      yPosition += 10;
    }
    
    // Tableau récapitulatif
    yPosition += 10;
    doc.setFontSize(16);
    doc.text('Récapitulatif des Métriques', 20, yPosition);
    
    const tableData = [
      ['Métrique', 'Valeur', 'Statut'],
      ['Score IA', `${data.scoreIA?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.scoreIA)],
      ['Confiance', `${data.confiance?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.confiance)],
      ['Conformité', `${data.tauxConformite?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.tauxConformite)],
      ['Efficacité', `${data.efficacite?.toFixed(1) || 'N/A'}%`, this.getStatusText(data.efficacite)]
    ];
    
    (doc as any).autoTable({
      startY: yPosition + 10,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    // Sauvegarder le PDF
    doc.save(filename);
  }

  // Exporter les données en Excel
  exportDataToExcel(data: any[], filename: string = 'dashboard-ia.xlsx'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    
    // Ajuster la largeur des colonnes
    const columnWidths: Array<{ wch: number }> = [];
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      headers.forEach(header => {
        columnWidths.push({ wch: Math.max(header.length + 2, 15) });
      });
    }
    worksheet['!cols'] = columnWidths;
    
    const workbook: XLSX.WorkBook = { 
      Sheets: { 'Dashboard IA': worksheet }, 
      SheetNames: ['Dashboard IA'] 
    };
    
    XLSX.writeFile(workbook, filename);
  }

  // Exporter un graphique spécifique en image
  exportChartAsImage(canvas: HTMLCanvasElement, filename: string = 'chart.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Exporter les données de tendance
  exportTrendData(trendData: any, filename: string = 'tendances-ia.xlsx'): void {
    const data = [];
    
    if (trendData.labels && trendData.datasets) {
      const labels = trendData.labels;
      const datasets = trendData.datasets;
      
      for (let i = 0; i < labels.length; i++) {
        const row: any = { 'Période': labels[i] };
        
        datasets.forEach((dataset: any, index: number) => {
          if (dataset.data && dataset.data[i] !== undefined) {
            row[dataset.label || `Dataset ${index + 1}`] = dataset.data[i];
          }
        });
        
        data.push(row);
      }
    }
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter les prédictions de risques
  exportRiskPredictions(predictions: any[], filename: string = 'predictions-risques.xlsx'): void {
    const data = predictions.map(prediction => ({
      'Niveau de Risque': prediction.niveau,
      'Probabilité': `${prediction.probabilite}%`,
      'Description': prediction.description,
      'Impact': prediction.impact,
      'Recommandations': prediction.recommandations?.join('; ') || ''
    }));
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter les recommandations IA
  exportAIRecommendations(recommendations: any[], filename: string = 'recommandations-ia.xlsx'): void {
    const data = recommendations.map(rec => ({
      'Type': rec.type,
      'Titre': rec.titre,
      'Description': rec.description,
      'Priorité': rec.priorite,
      'Impact Attendu': rec.impactAttendu,
      'Délai Estimé': rec.delaiEstime,
      'Actions': rec.actions?.join('; ') || ''
    }));
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter les optimisations de processus
  exportProcessOptimizations(optimizations: any[], filename: string = 'optimisations-processus.xlsx'): void {
    const data = optimizations.map(opt => ({
      'Processus': opt.processus,
      'Efficacité Actuelle': `${opt.efficaciteActuelle}%`,
      'Efficacité Optimale': `${opt.efficaciteOptimale}%`,
      'Gains Potentiels': opt.gainsPotentiels?.join('; ') || '',
      'Actions d\'Optimisation': opt.actionsOptimisation?.join('; ') || '',
      'Délai d\'Implémentation': opt.delaiImplementation
    }));
    
    this.exportDataToExcel(data, filename);
  }

  // Exporter un rapport complet du dashboard IA
  exportCompleteDashboardReport(dashboardData: any, filename: string = 'rapport-dashboard-ia.pdf'): void {
    const doc = new jsPDF();
    
    // Page de titre
    doc.setFontSize(24);
    doc.text('Rapport Complet - Dashboard IA', 20, 30);
    doc.setFontSize(14);
    doc.text('Système de Suivi des Processus Qualité', 20, 45);
    doc.setFontSize(12);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 60);
    
    // Table des matières
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Table des Matières', 20, 20);
    doc.setFontSize(12);
    doc.text('1. Résumé Exécutif', 20, 40);
    doc.text('2. Métriques de Performance', 20, 50);
    doc.text('3. Analyses IA', 20, 60);
    doc.text('4. Recommandations', 20, 70);
    doc.text('5. Optimisations', 20, 80);
    doc.text('6. Annexes', 20, 90);
    
    // Résumé exécutif
    doc.addPage();
    doc.setFontSize(16);
    doc.text('1. Résumé Exécutif', 20, 20);
    doc.setFontSize(12);
    doc.text('Ce rapport présente une analyse complète des performances qualité', 20, 35);
    doc.text('basée sur l\'intelligence artificielle et les données collectées.', 20, 45);
    
    // Métriques
    if (dashboardData.metrics) {
      const metrics = dashboardData.metrics;
      doc.text(`Score IA: ${metrics.scoreIA?.toFixed(1) || 'N/A'}%`, 20, 65);
      doc.text(`Niveau de Confiance: ${metrics.confiance?.toFixed(1) || 'N/A'}%`, 20, 75);
      doc.text(`Alertes Critiques: ${metrics.alertes || 'N/A'}`, 20, 85);
      doc.text(`Optimisations Disponibles: ${metrics.optimisations || 'N/A'}`, 20, 95);
    }
    
    // Sauvegarder le rapport
    doc.save(filename);
  }

  // Méthodes utilitaires
  private getStatusText(value: number): string {
    if (value === undefined || value === null) return 'N/A';
    if (value >= 85) return 'Excellent';
    if (value >= 70) return 'Bon';
    if (value >= 60) return 'Moyen';
    return 'À améliorer';
  }

  // Exporter les données de performance
  exportPerformanceData(performanceData: any, filename: string = 'performance-qualite.xlsx'): void {
    const data = [
      { 'Métrique': 'Taux de Conformité', 'Valeur': performanceData.conformite || 0, 'Unité': '%', 'Objectif': 90 },
      { 'Métrique': 'Efficacité Processus', 'Valeur': performanceData.efficacite || 0, 'Unité': '%', 'Objectif': 85 },
      { 'Métrique': 'Temps de Traitement Moyen', 'Valeur': performanceData.tempsMoyen || 0, 'Unité': 'jours', 'Objectif': 5 },
      { 'Métrique': 'Fiches en Retard', 'Valeur': performanceData.fichesRetard || 0, 'Unité': 'fiches', 'Objectif': 0 },
      { 'Métrique': 'Fiches Bloquées', 'Valeur': performanceData.fichesBloquees || 0, 'Unité': 'fiches', 'Objectif': 0 }
    ];
    
    this.exportDataToExcel(data, filename);
  }
} 