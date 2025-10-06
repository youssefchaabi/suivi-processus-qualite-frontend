import { Component, OnInit, OnDestroy } from '@angular/core';
import { FicheQualiteService } from '../../services/fiche-qualite.service';
import { FicheSuiviService } from '../../services/fiche-suivi.service';
import { FicheProjetService } from '../../services/fiche-projet.service';
import { AiAnalyticsService, PredictionRisque, RecommandationIA, AnalyseTendance, OptimisationProcessus } from '../../services/ai-analytics.service';
import { AiAnalyticsApiService, DashboardIAData } from '../../services/ai-analytics-api.service';
import { ExportService } from '../../services/export.service';
import { FicheQualite } from '../../models/fiche-qualite';
import { FicheSuivi } from '../../models/fiche-suivi';
import { FicheProjet } from '../../models/fiche-projet';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ai-dashboard',
  templateUrl: './ai-dashboard.component.html',
  styleUrls: ['./ai-dashboard.component.scss']
})
export class AiDashboardComponent implements OnInit, OnDestroy {
  loading = true;
  private destroy$ = new Subject<void>();
  
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

  // Filtres interactifs
  selectedPeriod = 8; // mois
  selectedRiskLevel = 'ALL';
  selectedRecommendationType = 'ALL';
  autoRefresh = false; // Désactivé par défaut
  refreshInterval = 30000; // 30 secondes

  // Statistiques avancées
  tauxConformiteGlobal = 0;
  fichesEnRetard = 0;
  fichesBloquees = 0;
  efficaciteProcessus = 0;

  constructor(
    private ficheQualiteService: FicheQualiteService,
    private ficheSuiviService: FicheSuiviService,
    private ficheProjetService: FicheProjetService,
    private aiAnalyticsService: AiAnalyticsService,
    private aiAnalyticsApiService: AiAnalyticsApiService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.chargerDonneesIA();
    // Ne pas démarrer l'auto-refresh automatiquement
  }

  ngOnDestroy(): void {
    this.autoRefresh = false;
    this.destroy$.next();
    this.destroy$.complete();
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
      
      // Calculer les statistiques avancées
      this.calculerStatistiquesAvancees();
      
      // Lancer les analyses IA
      this.lancerAnalysesIA();
    }).catch(error => {
      console.error('Erreur lors du chargement des données IA:', error);
      this.loading = false;
    });
  }

  calculerStatistiquesAvancees(): void {
    const totalFiches = this.fichesQualite.length;
    const totalFichesSuivi = this.fichesSuivi.length;
    
    // Taux de conformité basé sur les fiches de suivi (plus précis)
    if (totalFichesSuivi > 0) {
      let totalConformite = 0;
      let fichesAvecConformite = 0;
      
      this.fichesSuivi.forEach(suivi => {
        if (suivi.tauxConformite !== null && suivi.tauxConformite !== undefined) {
          totalConformite += suivi.tauxConformite;
          fichesAvecConformite++;
        }
      });
      
      this.tauxConformiteGlobal = fichesAvecConformite > 0 ? 
        (totalConformite / fichesAvecConformite) : 0;
    } else {
      this.tauxConformiteGlobal = 0;
    }
    
    // Fiches en retard basées sur le délai de traitement
    this.fichesEnRetard = this.fichesSuivi.filter(s => 
      s.delaiTraitementJours && s.delaiTraitementJours > 15
    ).length;
    
    // Fiches bloquées
    this.fichesBloquees = this.fichesQualite.filter(f => f.statut === 'BLOQUE').length;
    
    // Efficacité processus basée sur le délai moyen et la conformité
    if (totalFichesSuivi > 0) {
      let totalDelai = 0;
      let fichesAvecDelai = 0;
      
      this.fichesSuivi.forEach(suivi => {
        if (suivi.delaiTraitementJours && suivi.delaiTraitementJours > 0) {
          totalDelai += suivi.delaiTraitementJours;
          fichesAvecDelai++;
        }
      });
      
      const delaiMoyen = fichesAvecDelai > 0 ? (totalDelai / fichesAvecDelai) : 0;
      
      // Efficacité = 100% - (délai moyen * 2) + bonus conformité
      this.efficaciteProcessus = Math.max(0, Math.min(100, 
        100 - (delaiMoyen * 2) + (this.tauxConformiteGlobal * 0.3)
      ));
    } else {
      this.efficaciteProcessus = 0;
    }
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
    // Score IA basé sur la qualité des données et la performance réelle
    const totalFiches = this.fichesQualite.length;
    const totalFichesSuivi = this.fichesSuivi.length;
    
    if (totalFiches === 0) {
      this.scoreIA = 0;
      this.niveauConfiance = 0;
      return;
    }
    
    // Score IA = (Taux de conformité * 0.4) + (Efficacité processus * 0.3) + (Qualité des données * 0.3)
    const scoreConformite = this.tauxConformiteGlobal * 0.4;
    const scoreEfficacite = this.efficaciteProcessus * 0.3;
    
    // Qualité des données basée sur la complétude et la cohérence
    let scoreQualiteDonnees = 0;
    if (totalFichesSuivi > 0) {
      // Bonus pour avoir des fiches de suivi (données structurées)
      scoreQualiteDonnees = Math.min(30, totalFichesSuivi * 2);
      
      // Bonus pour la cohérence des données
      const fichesAvecConformite = this.fichesSuivi.filter(s => 
        s.tauxConformite !== null && s.tauxConformite !== undefined
      ).length;
      const coherencedata = (fichesAvecConformite / totalFichesSuivi) * 10;
      scoreQualiteDonnees += coherencedata;
    }
    
    this.scoreIA = Math.min(100, Math.max(0, 
      scoreConformite + scoreEfficacite + scoreQualiteDonnees
    ));
    
    // Niveau de confiance basé sur la fiabilité des données
    let confiance = 0;
    
    // Base de confiance : 30% si on a des données
    if (totalFiches > 0) confiance += 30;
    
    // Bonus pour la qualité des fiches de suivi
    if (totalFichesSuivi > 0) {
      const ratioSuivi = Math.min(1, totalFichesSuivi / totalFiches);
      confiance += ratioSuivi * 40; // Max 40% pour le suivi
    }
    
    // Bonus pour la cohérence des indicateurs
    if (totalFichesSuivi > 0) {
      const fichesAvecIndicateurs = this.fichesSuivi.filter(s => 
        s.indicateursKpi && s.indicateursKpi.length > 0
      ).length;
      const ratioIndicateurs = fichesAvecIndicateurs / totalFichesSuivi;
      confiance += ratioIndicateurs * 30; // Max 30% pour les indicateurs
    }
    
    this.niveauConfiance = Math.min(100, Math.max(0, confiance));
    
    // Alertes critiques basées sur les données réelles
    this.alertesCritiques = this.calculerAlertesCritiques();
    
    // Opportunités d'optimisation basées sur l'analyse des processus
    this.opportunitesOptimisation = this.calculerOpportunitesOptimisation();
    
    // Debug: Afficher les détails des calculs
    this.afficherDetailsCalculs(scoreConformite, scoreEfficacite, scoreQualiteDonnees, confiance);
  }

  // Calculer les alertes critiques basées sur les données réelles
  private calculerAlertesCritiques(): number {
    let alertes = 0;
    
    // Alerte 1: Fiches bloquées
    if (this.fichesBloquees > 0) {
      alertes += 1;
    }
    
    // Alerte 2: Taux de conformité faible
    if (this.tauxConformiteGlobal < 50) {
      alertes += 1;
    }
    
    // Alerte 3: Délais de traitement élevés
    if (this.fichesEnRetard > 0) {
      alertes += 1;
    }
    
    // Alerte 4: Efficacité processus faible
    if (this.efficaciteProcessus < 40) {
      alertes += 1;
    }
    
    return alertes;
  }

  // Calculer les opportunités d'optimisation
  private calculerOpportunitesOptimisation(): number {
    let opportunites = 0;
    
    // Opportunité 1: Améliorer la conformité
    if (this.tauxConformiteGlobal < 80) {
      opportunites += 1;
    }
    
    // Opportunité 2: Réduire les délais
    if (this.fichesEnRetard > 0) {
      opportunites += 1;
    }
    
    // Opportunité 3: Améliorer l'efficacité
    if (this.efficaciteProcessus < 70) {
      opportunites += 1;
    }
    
    // Opportunité 4: Optimiser les processus bloqués
    if (this.fichesBloquees > 0) {
      opportunites += 1;
    }
    
    return opportunites;
  }

  // Méthode de debug pour afficher les détails des calculs
  private afficherDetailsCalculs(scoreConformite: number, scoreEfficacite: number, scoreQualiteDonnees: number, confiance: number): void {
    console.log('=== DÉTAILS DES CALCULS DASHBOARD IA ===');
    console.log('Données de base:');
    console.log('- Fiches Qualité:', this.fichesQualite.length);
    console.log('- Fiches Suivi:', this.fichesSuivi.length);
    console.log('- Fiches Projet:', this.fichesProjet.length);
    
    console.log('\nCalculs intermédiaires:');
    console.log('- Taux de conformité global:', this.tauxConformiteGlobal.toFixed(2) + '%');
    console.log('- Efficacité processus:', this.efficaciteProcessus.toFixed(2) + '%');
    console.log('- Fiches en retard:', this.fichesEnRetard);
    console.log('- Fiches bloquées:', this.fichesBloquees);
    
    console.log('\nCalcul Score IA:');
    console.log('- Score conformité (40%):', scoreConformite.toFixed(2));
    console.log('- Score efficacité (30%):', scoreEfficacite.toFixed(2));
    console.log('- Score qualité données (30%):', scoreQualiteDonnees.toFixed(2));
    console.log('- Score IA final:', this.scoreIA.toFixed(2));
    
    console.log('\nCalcul Niveau de Confiance:');
    console.log('- Confiance de base (30%):', 30);
    console.log('- Bonus suivi (40%):', (confiance - 30).toFixed(2));
    console.log('- Niveau de confiance final:', this.niveauConfiance.toFixed(2) + '%');
    
    console.log('\nAlertes et Opportunités:');
    console.log('- Alertes critiques:', this.alertesCritiques);
    console.log('- Opportunités d\'optimisation:', this.opportunitesOptimisation);
    console.log('==========================================');
  }

  // Filtres interactifs
  onPeriodChange(period: number): void {
    this.selectedPeriod = period;
    // Ne pas recharger toutes les données, juste mettre à jour les filtres
    // Les données sont déjà chargées, on peut juste recalculer les métriques
    this.calculerStatistiquesAvancees();
    this.calculerMetriquesIA();
  }

  onRiskLevelChange(level: string): void {
    this.selectedRiskLevel = level;
  }

  onRecommendationTypeChange(type: string): void {
    this.selectedRecommendationType = type;
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.demarrerAutoRefresh();
    } else {
      // Arrêter l'auto-refresh en complétant le Subject
      this.destroy$.next();
    }
  }

  // Actualiser manuellement les données
  actualiserDonnees(): void {
    this.chargerDonneesIA();
  }

  private demarrerAutoRefresh(): void {
    if (this.autoRefresh) {
      // Créer un nouveau Subject pour l'auto-refresh
      this.destroy$ = new Subject<void>();
      
      interval(this.refreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.autoRefresh) {
            this.chargerDonneesIA();
          }
        });
    }
  }

  // Export des données
  exportDashboardPDF(): void {
    const data = {
      scoreIA: this.scoreIA,
      confiance: this.niveauConfiance,
      alertes: this.alertesCritiques,
      tauxConformite: this.tauxConformiteGlobal,
      fichesEnRetard: this.fichesEnRetard,
      fichesBloquees: this.fichesBloquees,
      efficacite: this.efficaciteProcessus,
      predictions: this.predictionsRisques.length,
      recommandations: this.recommandations.length,
      optimisations: this.optimisations.length
    };
    this.exportService.exportChartsToPDF(data, 'dashboard-ia-complet.pdf');
  }

  exportDashboardExcel(): void {
    const data = [
      { 'Métrique': 'Score IA', 'Valeur': this.scoreIA, 'Unité': '%' },
      { 'Métrique': 'Niveau de Confiance', 'Valeur': this.niveauConfiance, 'Unité': '%' },
      { 'Métrique': 'Taux de Conformité', 'Valeur': this.tauxConformiteGlobal, 'Unité': '%' },
      { 'Métrique': 'Fiches en Retard', 'Valeur': this.fichesEnRetard, 'Unité': 'fiches' },
      { 'Métrique': 'Fiches Bloquées', 'Valeur': this.fichesBloquees, 'Unité': 'fiches' },
      { 'Métrique': 'Efficacité Processus', 'Valeur': this.efficaciteProcessus, 'Unité': '%' },
      { 'Métrique': 'Alertes Critiques', 'Valeur': this.alertesCritiques, 'Unité': 'alertes' },
      { 'Métrique': 'Opportunités d\'Optimisation', 'Valeur': this.opportunitesOptimisation, 'Unité': 'opportunités' }
    ];
    this.exportService.exportDataToExcel(data, 'dashboard-ia-metriques.xlsx');
  }

  // Méthodes de filtrage
  getFiltredPredictions(): PredictionRisque[] {
    if (this.selectedRiskLevel === 'ALL') {
      return this.predictionsRisques;
    }
    return this.predictionsRisques.filter(p => p.niveau === this.selectedRiskLevel);
  }

  getFiltredRecommendations(): RecommandationIA[] {
    if (this.selectedRecommendationType === 'ALL') {
      return this.recommandations;
    }
    return this.recommandations.filter(r => r.type === this.selectedRecommendationType);
  }

  // Méthodes utilitaires pour les couleurs et icônes
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

  getTauxConformiteColor(): string {
    if (this.tauxConformiteGlobal >= 85) return '#4caf50';
    if (this.tauxConformiteGlobal >= 70) return '#ff9800';
    return '#f44336';
  }

  getEfficaciteColor(): string {
    if (this.efficaciteProcessus >= 80) return '#4caf50';
    if (this.efficaciteProcessus >= 60) return '#ff9800';
    return '#f44336';
  }

  // Méthodes pour les données récentes
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

  // Méthodes pour les statistiques
  getStatutDistribution(): any[] {
    const stats = [
      { statut: 'TERMINE', count: this.fichesQualite.filter(f => f.statut === 'TERMINE').length, color: '#4caf50' },
      { statut: 'EN_COURS', count: this.fichesQualite.filter(f => f.statut === 'EN_COURS').length, color: '#ff9800' },
      { statut: 'BLOQUE', count: this.fichesQualite.filter(f => f.statut === 'BLOQUE').length, color: '#f44336' }
    ];
    return stats.filter(s => s.count > 0);
  }

  getTypeDistribution(): any[] {
    const types = this.fichesQualite.reduce((acc, fiche) => {
      const type = fiche.typeFiche || 'Non défini';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      color: this.getRandomColor()
    }));
  }

  private getRandomColor(): string {
    const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  

  // Méthodes pour les alertes et notifications
  getAlertesCritiquesCount(): number {
    return this.predictionsRisques.filter(p => p.niveau === 'CRITIQUE').length;
  }

  getRecommandationsUrgentesCount(): number {
    return this.recommandations.filter(r => r.type === 'URGENT').length;
  }

  getOptimisationsDisponiblesCount(): number {
    return this.optimisations.length;
  }

  // Méthodes pour les tendances
  getTendanceGlobale(): string {
    if (this.tauxConformiteGlobal > 85) return 'HAUSSE';
    if (this.tauxConformiteGlobal < 70) return 'BAISSE';
    return 'STABLE';
  }

  

  

  

  

  

  

  
} 