import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FicheQualite } from '../models/fiche-qualite';
import { FicheSuivi } from '../models/fiche-suivi';
import { FicheProjet } from '../models/fiche-projet';

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

@Injectable({
  providedIn: 'root'
})
export class AiAnalyticsService {

  constructor() { }

  // Analyse prédictive des risques
  analyserRisques(fichesQualite: FicheQualite[], fichesSuivi: FicheSuivi[]): Observable<PredictionRisque[]> {
    const predictions: PredictionRisque[] = [];

    // Analyse du taux de conformité
    const fichesTerminees = fichesQualite.filter(f => f.statut === 'TERMINE').length;
    const tauxConformite = fichesQualite.length > 0 ? (fichesTerminees / fichesQualite.length) * 100 : 0;

    if (tauxConformite < 70) {
      predictions.push({
        niveau: 'CRITIQUE',
        probabilite: 0.85,
        description: 'Taux de conformité très faible détecté',
        recommandations: [
          'Réviser les processus qualité',
          'Former les équipes aux bonnes pratiques',
          'Mettre en place un suivi renforcé'
        ],
        impact: 'Impact majeur sur la réputation et la conformité'
      });
    } else if (tauxConformite < 85) {
      predictions.push({
        niveau: 'ÉLEVÉ',
        probabilite: 0.65,
        description: 'Taux de conformité en dessous des objectifs',
        recommandations: [
          'Identifier les causes de non-conformité',
          'Renforcer les contrôles qualité',
          'Améliorer la communication'
        ],
        impact: 'Impact modéré sur l\'efficacité'
      });
    }

    // Analyse des fiches en retard
    const fichesEnRetard = fichesQualite.filter(f => f.statut === 'EN_COURS').length;
    if (fichesEnRetard > fichesQualite.length * 0.3) {
      predictions.push({
        niveau: 'ÉLEVÉ',
        probabilite: 0.75,
        description: 'Trop de fiches en cours de traitement',
        recommandations: [
          'Prioriser les fiches urgentes',
          'Allouer plus de ressources',
          'Optimiser les processus de traitement'
        ],
        impact: 'Risque de retard généralisé'
      });
    }

    // Analyse des types de fiches problématiques
    const typesProblematiques = this.analyserTypesProblematiques(fichesQualite);
    if (typesProblematiques.length > 0) {
      predictions.push({
        niveau: 'MOYEN',
        probabilite: 0.55,
        description: 'Types de fiches avec taux d\'échec élevé détectés',
        recommandations: [
          'Analyser les causes spécifiques',
          'Former les équipes sur ces types',
          'Créer des templates spécialisés'
        ],
        impact: 'Impact sur l\'efficacité globale'
      });
    }

    return of(predictions);
  }

  // Génération de recommandations intelligentes
  genererRecommandations(fichesQualite: FicheQualite[], fichesSuivi: FicheSuivi[], fichesProjet: FicheProjet[]): Observable<RecommandationIA[]> {
    const recommandations: RecommandationIA[] = [];

    // Analyse des métriques
    const totalFiches = fichesQualite.length;
    const fichesTerminees = fichesQualite.filter(f => f.statut === 'TERMINE').length;
    const tauxConformite = totalFiches > 0 ? (fichesTerminees / totalFiches) * 100 : 0;

    // Recommandations basées sur le taux de conformité
    if (tauxConformite < 70) {
      recommandations.push({
        type: 'URGENT',
        titre: 'Amélioration critique du taux de conformité',
        description: 'Le taux de conformité est très faible et nécessite une action immédiate',
        priorite: 1,
        actions: [
          'Audit complet des processus qualité',
          'Formation intensive des équipes',
          'Mise en place de contrôles renforcés',
          'Révision des procédures'
        ],
        impactAttendu: 'Amélioration de 20-30% du taux de conformité',
        delaiEstime: '2-3 semaines'
      });
    }

    // Recommandations basées sur les fiches de suivi
    if (fichesSuivi.length === 0) {
      recommandations.push({
        type: 'IMPORTANT',
        titre: 'Mise en place du suivi qualité',
        description: 'Aucune fiche de suivi n\'existe, essentiel pour le contrôle qualité',
        priorite: 2,
        actions: [
          'Créer des fiches de suivi pour toutes les fiches qualité',
          'Former les équipes au suivi qualité',
          'Établir des points de contrôle réguliers'
        ],
        impactAttendu: 'Amélioration du contrôle et de la traçabilité',
        delaiEstime: '1-2 semaines'
      });
    }

    // Recommandations d'optimisation
    if (totalFiches > 10) {
      recommandations.push({
        type: 'SUGGESTION',
        titre: 'Optimisation des processus qualité',
        description: 'Opportunité d\'améliorer l\'efficacité des processus',
        priorite: 3,
        actions: [
          'Automatiser les tâches répétitives',
          'Standardiser les procédures',
          'Mettre en place des indicateurs de performance'
        ],
        impactAttendu: 'Réduction de 15-25% du temps de traitement',
        delaiEstime: '3-4 semaines'
      });
    }

    // Recommandations basées sur les projets
    if (fichesProjet.length > 0) {
      const projetsEnCours = fichesProjet.filter(p => p.statut === 'EN_COURS').length;
      if (projetsEnCours > fichesProjet.length * 0.5) {
        recommandations.push({
          type: 'IMPORTANT',
          titre: 'Gestion de la charge de travail',
          description: 'Trop de projets en cours simultanément',
          priorite: 2,
          actions: [
            'Prioriser les projets critiques',
            'Répartir la charge de travail',
            'Allouer des ressources supplémentaires'
          ],
          impactAttendu: 'Amélioration de la qualité de livraison',
          delaiEstime: '1 semaine'
        });
      }
    }

    return of(recommandations.sort((a, b) => a.priorite - b.priorite));
  }

  // Analyse des tendances
  analyserTendances(fichesQualite: FicheQualite[]): Observable<AnalyseTendance[]> {
    const tendances: AnalyseTendance[] = [];

    // Simulation d'analyse de tendances
    const totalFiches = fichesQualite.length;
    const fichesTerminees = fichesQualite.filter(f => f.statut === 'TERMINE').length;
    const tauxConformite = totalFiches > 0 ? (fichesTerminees / totalFiches) * 100 : 0;

    // Tendance du taux de conformité
    if (tauxConformite > 85) {
      tendances.push({
        periode: 'Ce mois',
        tendance: 'HAUSSE',
        valeur: tauxConformite,
        variation: 5.2,
        explication: 'Amélioration continue des processus qualité'
      });
    } else if (tauxConformite < 70) {
      tendances.push({
        periode: 'Ce mois',
        tendance: 'BAISSE',
        valeur: tauxConformite,
        variation: -8.5,
        explication: 'Dégradation des performances qualité'
      });
    } else {
      tendances.push({
        periode: 'Ce mois',
        tendance: 'STABLE',
        valeur: tauxConformite,
        variation: 0.3,
        explication: 'Performance stable mais amélioration possible'
      });
    }

    // Tendance du volume de travail
    if (totalFiches > 20) {
      tendances.push({
        periode: 'Ce mois',
        tendance: 'HAUSSE',
        valeur: totalFiches,
        variation: 15.0,
        explication: 'Augmentation de l\'activité qualité'
      });
    }

    return of(tendances);
  }

  // Optimisation des processus
  optimiserProcessus(fichesQualite: FicheQualite[], fichesSuivi: FicheSuivi[]): Observable<OptimisationProcessus[]> {
    const optimisations: OptimisationProcessus[] = [];

    // Analyse de l'efficacité des processus
    const totalFiches = fichesQualite.length;
    const fichesTerminees = fichesQualite.filter(f => f.statut === 'TERMINE').length;
    const efficaciteActuelle = totalFiches > 0 ? (fichesTerminees / totalFiches) * 100 : 0;

    // Optimisation du processus de validation
    optimisations.push({
      processus: 'Validation des fiches qualité',
      efficaciteActuelle: efficaciteActuelle,
      efficaciteOptimale: 95,
      gainsPotentiels: [
        'Réduction de 30% du temps de validation',
        'Amélioration de 25% de la précision',
        'Réduction de 40% des erreurs'
      ],
      actionsOptimisation: [
        'Automatiser les contrôles de base',
        'Standardiser les critères de validation',
        'Former les validateurs aux nouvelles procédures',
        'Mettre en place un système de validation en cascade'
      ],
      delaiImplementation: '4-6 semaines'
    });

    // Optimisation du suivi qualité
    if (fichesSuivi.length > 0) {
      optimisations.push({
        processus: 'Suivi qualité',
        efficaciteActuelle: 75,
        efficaciteOptimale: 90,
        gainsPotentiels: [
          'Amélioration de 20% de la traçabilité',
          'Réduction de 35% du temps de suivi',
          'Amélioration de 30% de la réactivité'
        ],
        actionsOptimisation: [
          'Mettre en place des alertes automatiques',
          'Créer des tableaux de bord temps réel',
          'Automatiser les rapports de suivi',
          'Former les pilotes qualité aux nouveaux outils'
        ],
        delaiImplementation: '3-4 semaines'
      });
    }

    return of(optimisations);
  }

  // Analyse des types problématiques
  private analyserTypesProblematiques(fichesQualite: FicheQualite[]): string[] {
    const typesProblematiques: string[] = [];
    const types = this.groupBy(fichesQualite, 'typeFiche');
    
    for (const [type, fiches] of Object.entries(types)) {
      const fichesTerminees = fiches.filter((f: FicheQualite) => f.statut === 'TERMINE').length;
      const tauxReussite = fiches.length > 0 ? (fichesTerminees / fiches.length) * 100 : 0;
      
      if (tauxReussite < 60) {
        typesProblematiques.push(type);
      }
    }
    
    return typesProblematiques;
  }

  // Méthode utilitaire pour grouper les données
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

  // Génération de rapports IA
  genererRapportIA(fichesQualite: FicheQualite[], fichesSuivi: FicheSuivi[], fichesProjet: FicheProjet[]): Observable<any> {
    const rapport = {
      dateGeneration: new Date(),
      resume: {
        totalFiches: fichesQualite.length,
        totalSuivis: fichesSuivi.length,
        totalProjets: fichesProjet.length,
        tauxConformite: fichesQualite.length > 0 ? 
          (fichesQualite.filter(f => f.statut === 'TERMINE').length / fichesQualite.length) * 100 : 0
      },
      alertes: this.genererAlertes(fichesQualite, fichesSuivi),
      predictions: this.genererPredictions(fichesQualite),
      recommandations: this.genererRecommandationsRapides(fichesQualite, fichesSuivi)
    };

    return of(rapport);
  }

  private genererAlertes(fichesQualite: FicheQualite[], fichesSuivi: FicheSuivi[]): any[] {
    const alertes = [];
    
    const tauxConformite = fichesQualite.length > 0 ? 
      (fichesQualite.filter(f => f.statut === 'TERMINE').length / fichesQualite.length) * 100 : 0;
    
    if (tauxConformite < 70) {
      alertes.push({
        niveau: 'CRITIQUE',
        message: 'Taux de conformité critique',
        description: `Le taux de conformité est de ${tauxConformite.toFixed(1)}%, en dessous du seuil de 70%`
      });
    }

    const fichesEnRetard = fichesQualite.filter(f => f.statut === 'EN_COURS').length;
    if (fichesEnRetard > fichesQualite.length * 0.3) {
      alertes.push({
        niveau: 'ATTENTION',
        message: 'Trop de fiches en cours',
        description: `${fichesEnRetard} fiches en cours de traitement`
      });
    }

    return alertes;
  }

  private genererPredictions(fichesQualite: FicheQualite[]): any[] {
    const predictions = [];
    
    // Prédiction basée sur les tendances actuelles
    const tauxConformite = fichesQualite.length > 0 ? 
      (fichesQualite.filter(f => f.statut === 'TERMINE').length / fichesQualite.length) * 100 : 0;
    
    if (tauxConformite < 80) {
      predictions.push({
        type: 'RISQUE',
        description: 'Risque de dégradation du taux de conformité dans les 30 prochains jours',
        probabilite: 0.75,
        actions: ['Renforcer les contrôles', 'Former les équipes', 'Réviser les processus']
      });
    }

    return predictions;
  }

  private genererRecommandationsRapides(fichesQualite: FicheQualite[], fichesSuivi: FicheSuivi[]): any[] {
    const recommandations = [];
    
    if (fichesSuivi.length === 0) {
      recommandations.push({
        priorite: 'HAUTE',
        action: 'Créer des fiches de suivi',
        raison: 'Aucune fiche de suivi n\'existe'
      });
    }

    const fichesEnCours = fichesQualite.filter(f => f.statut === 'EN_COURS').length;
    if (fichesEnCours > 5) {
      recommandations.push({
        priorite: 'MOYENNE',
        action: 'Prioriser les fiches en cours',
        raison: `${fichesEnCours} fiches en cours nécessitent un suivi`
      });
    }

    return recommandations;
  }
} 