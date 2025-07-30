import { Component, OnInit } from '@angular/core';
import { FicheQualiteService } from '../services/fiche-qualite.service';
import { FicheSuiviService } from '../services/fiche-suivi.service';
import { FicheProjetService } from '../services/fiche-projet.service';
import { FicheQualite } from '../models/fiche-qualite';
import { FicheSuivi } from '../models/fiche-suivi';
import { FicheProjet } from '../models/fiche-projet';

interface KpiMetric {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend?: string;
  description: string;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-kpi',
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss']
})
export class KpiComponent implements OnInit {
  loading = true;
  
  // Métriques principales
  metrics: KpiMetric[] = [];
  
  // Données pour graphiques
  statutChartData: ChartData = { labels: [], datasets: [] };
  typeChartData: ChartData = { labels: [], datasets: [] };
  evolutionChartData: ChartData = { labels: [], datasets: [] };
  
  // Tableaux de données
  fichesQualite: FicheQualite[] = [];
  fichesSuivi: FicheSuivi[] = [];
  fichesProjet: FicheProjet[] = [];
  
  // Statistiques détaillées
  totalFichesQualite = 0;
  totalFichesSuivi = 0;
  totalFichesProjet = 0;
  tauxConformite = 0;
  tauxAvancement = 0;
  delaiMoyen = 0;

  constructor(
    private ficheQualiteService: FicheQualiteService,
    private ficheSuiviService: FicheSuiviService,
    private ficheProjetService: FicheProjetService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.loading = true;
    
    // Charger toutes les données
    Promise.all([
      this.ficheQualiteService.getAll().toPromise(),
      this.ficheSuiviService.getAll().toPromise(),
      this.ficheProjetService.getAll().toPromise()
    ]).then(([fichesQualite, fichesSuivi, fichesProjet]) => {
      this.fichesQualite = fichesQualite || [];
      this.fichesSuivi = fichesSuivi || [];
      this.fichesProjet = fichesProjet || [];
      
      this.calculerMetriques();
      this.preparerGraphiques();
      this.loading = false;
    }).catch(error => {
      console.error('Erreur lors du chargement des données KPI:', error);
      this.loading = false;
    });
  }

  calculerMetriques(): void {
    // Calculs des métriques principales
    this.totalFichesQualite = this.fichesQualite.length;
    this.totalFichesSuivi = this.fichesSuivi.length;
    this.totalFichesProjet = this.fichesProjet.length;
    
    // Taux de conformité (fiches terminées / total)
    const fichesTerminees = this.fichesQualite.filter(f => f.statut === 'TERMINE').length;
    this.tauxConformite = this.totalFichesQualite > 0 ? (fichesTerminees / this.totalFichesQualite) * 100 : 0;
    
    // Taux d'avancement (fiches en cours / total)
    const fichesEnCours = this.fichesQualite.filter(f => f.statut === 'EN_COURS').length;
    this.tauxAvancement = this.totalFichesQualite > 0 ? (fichesEnCours / this.totalFichesQualite) * 100 : 0;
    
    // Délai moyen (calcul simplifié)
    this.delaiMoyen = this.calculerDelaiMoyen();

    // Métriques pour l'affichage
    this.metrics = [
      {
        title: 'Fiches Qualité',
        value: this.totalFichesQualite,
        icon: 'assignment',
        color: '#1976d2',
        description: 'Total des fiches qualité'
      },
      {
        title: 'Fiches de Suivi',
        value: this.totalFichesSuivi,
        icon: 'assignment_turned_in',
        color: '#388e3c',
        description: 'Total des fiches de suivi'
      },
      {
        title: 'Fiches Projet',
        value: this.totalFichesProjet,
        icon: 'work',
        color: '#f57c00',
        description: 'Total des fiches projet'
      },
      {
        title: 'Taux Conformité',
        value: Math.round(this.tauxConformite),
        icon: 'check_circle',
        color: '#388e3c',
        description: 'Pourcentage de conformité'
      },
      {
        title: 'Taux Avancement',
        value: Math.round(this.tauxAvancement),
        icon: 'trending_up',
        color: '#1976d2',
        description: 'Pourcentage d\'avancement'
      },
      {
        title: 'Délai Moyen',
        value: Math.round(this.delaiMoyen),
        icon: 'schedule',
        color: '#f57c00',
        description: 'Délai moyen en jours'
      }
    ];
  }

  preparerGraphiques(): void {
    // Graphique par statut
    const statuts = this.groupBy(this.fichesQualite, 'statut');
    this.statutChartData = {
      labels: Object.keys(statuts),
      datasets: [{
        data: Object.values(statuts).map((arr: any) => arr.length),
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
        borderWidth: 2
      }]
    };

    // Graphique par type
    const types = this.groupBy(this.fichesQualite, 'typeFiche');
    this.typeChartData = {
      labels: Object.keys(types),
      datasets: [{
        data: Object.values(types).map((arr: any) => arr.length),
        backgroundColor: ['#9c27b0', '#3f51b5', '#009688', '#ff5722'],
        borderWidth: 2
      }]
    };

    // Graphique d'évolution (simulation)
    this.evolutionChartData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Fiches créées',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true
      }]
    };
  }

  // Méthodes pour calculer les hauteurs des graphiques
  getStatutBarHeight(data: number): string {
    const maxValue = Math.max(...this.statutChartData.datasets[0]?.data || [1]);
    return (data / maxValue) * 200 + 'px';
  }

  getTypeBarHeight(data: number): string {
    const maxValue = Math.max(...this.typeChartData.datasets[0]?.data || [1]);
    return (data / maxValue) * 200 + 'px';
  }

  getEvolutionPointBottom(data: number): string {
    const maxValue = Math.max(...this.evolutionChartData.datasets[0]?.data || [1]);
    return (data / maxValue) * 100 + '%';
  }

  getEvolutionPointLeft(index: number): string {
    const totalPoints = this.evolutionChartData.datasets[0]?.data.length || 1;
    return (index / (totalPoints - 1)) * 100 + '%';
  }

  private groupBy(array: any[], key: string): { [key: string]: any[] } {
    return array.reduce((result, item) => {
      const group = item[key] || 'Non défini';
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  }

  private calculerDelaiMoyen(): number {
    // Calcul simplifié du délai moyen
    if (this.fichesQualite.length === 0) return 0;
    
    const fichesTerminees = this.fichesQualite.filter(f => f.statut === 'TERMINE');
    if (fichesTerminees.length === 0) return 0;
    
    // Simulation d'un délai moyen de 15 jours
    return 15;
  }

  getFichesRecentes(): FicheQualite[] {
    // Retourne les 5 premières fiches (sans tri par date car dateCreation n'existe plus)
    return this.fichesQualite.slice(0, 5);
  }

  getFichesEnRetard(): FicheQualite[] {
    // Simulation des fiches en retard
    return this.fichesQualite.filter(f => f.statut === 'EN_COURS').slice(0, 3);
  }
} 