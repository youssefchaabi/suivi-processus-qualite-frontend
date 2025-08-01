import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  // Export PDF des graphiques
  exportChartsToPDF(chartData: any, filename: string = 'rapport-ia.pdf') {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(20);
    doc.text('Rapport IA - Dashboard Qualité', 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 35);
    
    // Métriques
    doc.setFontSize(16);
    doc.text('Métriques IA', 20, 50);
    doc.setFontSize(12);
    doc.text(`Score IA: ${chartData.scoreIA || 85}`, 20, 60);
    doc.text(`Confiance IA: ${chartData.confiance || 92}%`, 20, 70);
    doc.text(`Alertes critiques: ${chartData.alertes || 1}`, 20, 80);
    
    // Graphiques (placeholders)
    doc.setFontSize(16);
    doc.text('Graphiques IA', 20, 100);
    doc.setFontSize(12);
    doc.text('• Évolution des tendances', 20, 110);
    doc.text('• Analyse prédictive des risques', 20, 120);
    doc.text('• Répartition des KPI', 20, 130);
    
    // Sauvegarder
    doc.save(filename);
  }

  // Export Excel des données
  exportDataToExcel(data: any[], filename: string = 'donnees-ia.xlsx') {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Données IA': worksheet }, SheetNames: ['Données IA'] };
    XLSX.writeFile(workbook, filename);
  }

  // Export des graphiques en image
  exportChartAsImage(chartElement: HTMLCanvasElement, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = chartElement.toDataURL('image/png');
    link.click();
  }
} 