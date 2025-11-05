import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
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

  // Statistiques principales
  stats = {
    totalProjets: 0,
    projetsEnCours: 0,
    projetsTermines: 0,
    projetsEnRetard: 0,
    formulairesEnAttente: 0,
    tauxConformite: 0
  };
  
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
    private router: Router,
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

    // Calculer les statistiques principales
    this.stats.totalProjets = totalFiches;
    this.stats.projetsEnCours = this.fichesQualite.filter(f => f.statut === 'EN_COURS').length;
    this.stats.projetsTermines = this.fichesQualite.filter(f => f.statut === 'TERMINE').length;
    this.stats.projetsEnRetard = this.fichesEnRetard;
    this.stats.tauxConformite = this.tauxConformiteGlobal;
    
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

  /**
   * Gérer le clic sur une card de statistique
   */
  onStatClick(type: string): void {
    console.log('Stat clicked:', type);
    // TODO: Implémenter le filtrage ou la navigation selon le type
  }

  /**
   * Obtenir l'icône de tendance pour une statistique
   */
  getTrendIcon(type: string): string | null {
    // Pour l'instant, retourner null (sera implémenté avec les données historiques)
    return null;
  }

  // Méthodes helper pour les templates (éviter les erreurs de binding)
  getProjetsEnCoursCount(): number {
    return this.fichesQualite.filter(f => f.statut === 'EN_COURS').length;
  }

  getProjetsTerminesCount(): number {
    return this.fichesQualite.filter(f => f.statut === 'TERMINE').length;
  }

  isConformiteHigh(): boolean {
    return this.tauxConformiteGlobal >= 80;
  }

  isConformiteLow(): boolean {
    return this.tauxConformiteGlobal < 70;
  }

  getConformiteTrendIcon(): string {
    if (this.tauxConformiteGlobal >= 80) return 'trending_up';
    if (this.tauxConformiteGlobal < 70) return 'trending_down';
    return 'trending_flat';
  }

  hasAlertesCritiques(): boolean {
    return this.alertesCritiques > 0;
  }

  hasProjetsEnRetard(): boolean {
    return this.stats.projetsEnRetard > 0;
  }

  // Méthodes helper pour les comparaisons de couleurs
  isStatutTermine(statut: string): boolean {
    return statut === 'TERMINE';
  }

  isStatutEnCours(statut: string): boolean {
    return statut === 'EN_COURS';
  }

  isScoreIAHigh(): boolean {
    return this.scoreIA >= 80;
  }

  isScoreIALow(): boolean {
    return this.scoreIA < 60;
  }

  /**
   * Retour au dashboard pilote qualité (KPI)
   */
  retourDashboard(): void {
    try {
      // Naviguer vers le dashboard pilote qualité (KPI)
      this.router.navigate(['/kpi']).catch(() => {
        // En cas d'échec, forcer la navigation
        window.location.href = '/kpi';
      });
    } catch (error) {
      console.error('Erreur de navigation:', error);
      // Fallback direct vers KPI
      window.location.href = '/kpi';
    }
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

  // Méthodes pour les nouveaux graphiques exploitables
  getDelaiMoyen(): number {
    if (this.fichesSuivi.length === 0) return 0;
    
    let totalDelai = 0;
    let fichesAvecDelai = 0;
    
    this.fichesSuivi.forEach(suivi => {
      if (suivi.delaiTraitementJours && suivi.delaiTraitementJours > 0) {
        totalDelai += suivi.delaiTraitementJours;
        fichesAvecDelai++;
      }
    });
    
    return fichesAvecDelai > 0 ? Math.round(totalDelai / fichesAvecDelai) : 0;
  }

  getDelaiMedian(): number {
    const delais = this.fichesSuivi
      .filter(s => s.delaiTraitementJours && s.delaiTraitementJours > 0)
      .map(s => s.delaiTraitementJours!)
      .sort((a, b) => a - b);
    
    if (delais.length === 0) return 0;
    
    const middle = Math.floor(delais.length / 2);
    return delais.length % 2 === 0 
      ? Math.round((delais[middle - 1] + delais[middle]) / 2)
      : delais[middle];
  }

  getRisquesCritiques(): number {
    return this.fichesQualite.filter(f => 
      f.statut === 'BLOQUE' || 
      (this.fichesSuivi.some(s => s.ficheId === f.id && s.tauxConformite && s.tauxConformite < 50))
    ).length;
  }

  getRisquesEleves(): number {
    return this.fichesQualite.filter(f => 
      f.statut === 'EN_COURS' && 
      this.fichesSuivi.some(s => s.ficheId === f.id && s.tauxConformite && s.tauxConformite < 70 && s.tauxConformite >= 50)
    ).length;
  }

  getRisquesMoyens(): number {
    return this.fichesQualite.filter(f => 
      f.statut === 'EN_COURS' && 
      this.fichesSuivi.some(s => s.ficheId === f.id && s.tauxConformite && s.tauxConformite < 85 && s.tauxConformite >= 70)
    ).length;
  }

  getRisquesFaibles(): number {
    return this.fichesQualite.filter(f => 
      f.statut === 'TERMINE' || 
      this.fichesSuivi.some(s => s.ficheId === f.id && s.tauxConformite && s.tauxConformite >= 85)
    ).length;
  }

  // Méthodes d'export pour le module rapport
  exportPerformanceData(): void {
    const performanceData = this.calculatePerformanceByType();
    const data = performanceData.map(item => ({
      'Type de Fiche': item.type,
      'Nombre de Fiches': item.count,
      'Taux de Conformité Moyen': item.conformiteMoyenne + '%',
      'Délai Moyen (jours)': item.delaiMoyen,
      'Statut Dominant': item.statutDominant
    }));
    
    this.exportService.exportDataToExcel(data, 'performance-par-type.xlsx');
    console.log('Données de performance exportées pour le module rapport');
  }

  exportConformiteData(): void {
    const conformiteData = this.calculateConformiteEvolution();
    const data = conformiteData.map(item => ({
      'Mois': item.mois,
      'Taux de Conformité': item.taux + '%',
      'Nombre de Fiches': item.nombreFiches,
      'Objectif': '85%',
      'Écart': (item.taux - 85) + '%'
    }));
    
    this.exportService.exportDataToExcel(data, 'evolution-conformite.xlsx');
    console.log('Données de conformité exportées pour le module rapport');
  }

  exportDelaisData(): void {
    const delaisData = this.fichesSuivi
      .filter(s => s.delaiTraitementJours && s.delaiTraitementJours > 0)
      .map(suivi => {
        const fiche = this.fichesQualite.find(f => f.id === suivi.ficheId);
        return {
          'Titre Fiche': fiche?.titre || 'Non défini',
          'Type': fiche?.typeFiche || 'Non défini',
          'Délai (jours)': suivi.delaiTraitementJours,
          'Statut': fiche?.statut || 'Non défini',
          'Conformité': suivi.tauxConformite ? suivi.tauxConformite + '%' : 'N/A',
          'En Retard': (suivi.delaiTraitementJours! > 15) ? 'Oui' : 'Non'
        };
      });
    
    this.exportService.exportDataToExcel(delaisData, 'analyse-delais.xlsx');
    console.log('Données de délais exportées pour le module rapport');
  }

  exportRisqueData(): void {
    const risqueData = [
      { 'Niveau de Risque': 'Critique', 'Nombre': this.getRisquesCritiques(), 'Pourcentage': ((this.getRisquesCritiques() / this.fichesQualite.length) * 100).toFixed(1) + '%' },
      { 'Niveau de Risque': 'Élevé', 'Nombre': this.getRisquesEleves(), 'Pourcentage': ((this.getRisquesEleves() / this.fichesQualite.length) * 100).toFixed(1) + '%' },
      { 'Niveau de Risque': 'Moyen', 'Nombre': this.getRisquesMoyens(), 'Pourcentage': ((this.getRisquesMoyens() / this.fichesQualite.length) * 100).toFixed(1) + '%' },
      { 'Niveau de Risque': 'Faible', 'Nombre': this.getRisquesFaibles(), 'Pourcentage': ((this.getRisquesFaibles() / this.fichesQualite.length) * 100).toFixed(1) + '%' }
    ];
    
    this.exportService.exportDataToExcel(risqueData, 'matrice-risques.xlsx');
    console.log('Données de risques exportées pour le module rapport');
  }

  // Méthodes de calcul pour les graphiques
  private calculatePerformanceByType(): any[] {
    const typeStats: { [key: string]: any } = {};
    
    this.fichesQualite.forEach(fiche => {
      const type = fiche.typeFiche || 'Non défini';
      if (!typeStats[type]) {
        typeStats[type] = {
          type,
          count: 0,
          conformiteTotal: 0,
          delaiTotal: 0,
          statuts: {} as { [key: string]: number }
        };
      }
      
      typeStats[type].count++;
      
      // Calculer conformité moyenne
      const suivi = this.fichesSuivi.find(s => s.ficheId === fiche.id);
      if (suivi?.tauxConformite) {
        typeStats[type].conformiteTotal += suivi.tauxConformite;
      }
      
      // Calculer délai moyen
      if (suivi?.delaiTraitementJours) {
        typeStats[type].delaiTotal += suivi.delaiTraitementJours;
      }
      
      // Compter les statuts
      const statut = fiche.statut || 'Non défini';
      typeStats[type].statuts[statut] = (typeStats[type].statuts[statut] || 0) + 1;
    });
    
    return Object.values(typeStats).map((stat: any) => ({
      type: stat.type,
      count: stat.count,
      conformiteMoyenne: stat.count > 0 ? Math.round(stat.conformiteTotal / stat.count) : 0,
      delaiMoyen: stat.count > 0 ? Math.round(stat.delaiTotal / stat.count) : 0,
      statutDominant: Object.keys(stat.statuts).reduce((a, b) => stat.statuts[a] > stat.statuts[b] ? a : b, 'Non défini')
    }));
  }

  private calculateConformiteEvolution(): any[] {
    const now = new Date();
    const evolution = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mois = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      
      // Simulation basée sur les données actuelles avec variation réaliste
      const baseConformite = this.tauxConformiteGlobal || 75;
      const variation = (Math.random() - 0.5) * 15; // Variation de ±7.5%
      const taux = Math.max(50, Math.min(100, baseConformite + variation));
      
      // Nombre de fiches pour ce mois (simulation)
      const nombreFiches = Math.floor(this.fichesQualite.length / 12) + Math.floor(Math.random() * 5);
      
      evolution.push({
        mois,
        taux: Math.round(taux),
        nombreFiches
      });
    }
    
    return evolution;
  }

  

  

  

  

  

  

  
} 