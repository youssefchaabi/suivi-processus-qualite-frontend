import { Component, OnInit } from '@angular/core';
import { FicheQualiteService } from '../../services/fiche-qualite.service';
import { FicheSuiviService } from '../../services/fiche-suivi.service';
import { FicheProjetService } from '../../services/fiche-projet.service';
import { AiAnalyticsService, PredictionRisque, RecommandationIA, AnalyseTendance, OptimisationProcessus } from '../../services/ai-analytics.service';
import { AiAnalyticsApiService, DashboardIAData } from '../../services/ai-analytics-api.service';
import { FicheQualite } from '../../models/fiche-qualite';
import { FicheSuivi } from '../../models/fiche-suivi';
import { FicheProjet } from '../../models/fiche-projet';

@Component({
  selector: 'app-ai-dashboard',
  templateUrl: './ai-dashboard.component.html',
  styleUrls: ['./ai-dashboard.component.scss']
})
export class AiDashboardComponent implements OnInit {
  loading = true;
  
  // Données
  fichesQualite: FicheQualite[] = [];
  fichesSuivi: FicheSuivi[] = [];
  fichesProjet: FicheProjet[] = [];
  
  // Analyses IA
  predictionsRisques: PredictionRisque[] = [];
  recommandations: RecommandationIA[] = [];
  tendances: AnalyseTendance[] = [];
  optimisations: OptimisationProcessus[] = [];
  
  // Métriques IA
  scoreIA = 0;
  niveauConfiance = 0;
  alertesCritiques = 0;
  opportunitesOptimisation = 0;

  constructor(
    private ficheQualiteService: FicheQualiteService,
    private ficheSuiviService: FicheSuiviService,
    private ficheProjetService: FicheProjetService,
    private aiAnalyticsService: AiAnalyticsService,
    private aiAnalyticsApiService: AiAnalyticsApiService
  ) {}

  ngOnInit(): void {
    this.chargerDonneesIA();
  }

  chargerDonneesIA(): void {
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
      
      // Lancer les analyses IA
      this.lancerAnalysesIA();
    }).catch(error => {
      console.error('Erreur lors du chargement des données IA:', error);
      this.loading = false;
    });
  }

  lancerAnalysesIA(): void {
    // Utiliser les API backend pour les vraies analyses IA
    this.aiAnalyticsApiService.getDashboardData().subscribe({
      next: (data: DashboardIAData) => {
        this.predictionsRisques = data.risques.predictions || [];
        this.recommandations = data.recommandations.recommandations || [];
        this.tendances = data.tendances.tendances || [];
        this.optimisations = data.optimisations.optimisations || [];
        
        this.calculerMetriquesIA();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors des analyses IA:', error);
        // Fallback vers les analyses locales si l'API échoue
        this.lancerAnalysesLocales();
      }
    });
  }

  lancerAnalysesLocales(): void {
    // Analyses parallèles locales (fallback)
    Promise.all([
      this.aiAnalyticsService.analyserRisques(this.fichesQualite, this.fichesSuivi).toPromise(),
      this.aiAnalyticsService.genererRecommandations(this.fichesQualite, this.fichesSuivi, this.fichesProjet).toPromise(),
      this.aiAnalyticsService.analyserTendances(this.fichesQualite).toPromise(),
      this.aiAnalyticsService.optimiserProcessus(this.fichesQualite, this.fichesSuivi).toPromise()
    ]).then(([predictions, recommandations, tendances, optimisations]) => {
      this.predictionsRisques = predictions || [];
      this.recommandations = recommandations || [];
      this.tendances = tendances || [];
      this.optimisations = optimisations || [];
      
      this.calculerMetriquesIA();
      this.loading = false;
    }).catch(error => {
      console.error('Erreur lors des analyses IA locales:', error);
      this.loading = false;
    });
  }

  calculerMetriquesIA(): void {
    // Score IA basé sur la qualité des données et la cohérence
    const totalFiches = this.fichesQualite.length;
    const fichesTerminees = this.fichesQualite.filter(f => f.statut === 'TERMINE').length;
    const tauxConformite = totalFiches > 0 ? (fichesTerminees / totalFiches) * 100 : 0;
    
    this.scoreIA = Math.min(100, Math.max(0, tauxConformite + (this.fichesSuivi.length * 5)));
    
    // Niveau de confiance basé sur la quantité et qualité des données
    this.niveauConfiance = Math.min(100, Math.max(0, 
      (totalFiches * 10) + (this.fichesSuivi.length * 15) + (this.fichesProjet.length * 10)
    ));
    
    // Alertes critiques
    this.alertesCritiques = this.predictionsRisques.filter(p => p.niveau === 'CRITIQUE').length;
    
    // Opportunités d'optimisation
    this.opportunitesOptimisation = this.optimisations.length;
  }

  getNiveauRisqueColor(niveau: string): string {
    switch (niveau) {
      case 'CRITIQUE': return '#f44336';
      case 'ÉLEVÉ': return '#ff9800';
      case 'MOYEN': return '#ffc107';
      case 'FAIBLE': return '#4caf50';
      default: return '#9e9e9e';
    }
  }

  getTypeRecommandationColor(type: string): string {
    switch (type) {
      case 'URGENT': return '#f44336';
      case 'IMPORTANT': return '#ff9800';
      case 'SUGGESTION': return '#2196f3';
      default: return '#9e9e9e';
    }
  }

  getTendanceIcon(tendance: string): string {
    switch (tendance) {
      case 'HAUSSE': return 'trending_up';
      case 'BAISSE': return 'trending_down';
      case 'STABLE': return 'trending_flat';
      default: return 'help';
    }
  }

  getTendanceColor(tendance: string): string {
    switch (tendance) {
      case 'HAUSSE': return '#4caf50';
      case 'BAISSE': return '#f44336';
      case 'STABLE': return '#2196f3';
      default: return '#9e9e9e';
    }
  }

  getScoreIAColor(): string {
    if (this.scoreIA >= 80) return '#4caf50';
    if (this.scoreIA >= 60) return '#ff9800';
    return '#f44336';
  }

  getNiveauConfianceColor(): string {
    if (this.niveauConfiance >= 80) return '#4caf50';
    if (this.niveauConfiance >= 60) return '#ff9800';
    return '#f44336';
  }

  getFichesRecentes(): FicheQualite[] {
    return this.fichesQualite.slice(0, 5);
  }

  getFichesProblematiques(): FicheQualite[] {
    return this.fichesQualite.filter(f => f.statut === 'EN_COURS').slice(0, 3);
  }

  getRecommandationsUrgentes(): RecommandationIA[] {
    return this.recommandations.filter(r => r.type === 'URGENT').slice(0, 3);
  }

  getOptimisationsPrioritaires(): OptimisationProcessus[] {
    return this.optimisations.slice(0, 2);
  }
} 