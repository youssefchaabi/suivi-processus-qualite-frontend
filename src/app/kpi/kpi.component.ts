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
  retardThresholdDays = 15;

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
    
    // Taux de conformité basé sur les fiches de suivi (indicateursKpi)
    const conformiteStats = this.calculerConformiteDepuisSuivi();
    this.tauxConformite = conformiteStats.totalEvalues > 0 
      ? (conformiteStats.nbConformes / conformiteStats.totalEvalues) * 100 
      : 0;
    
    // Taux d'avancement (fiches en cours / total) avec normalisation des statuts
    const fichesEnCours = this.fichesQualite.filter(f => this.normaliserStatut(f.statut) === 'EN_COURS').length;
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
        description: 'Pourcentage de conformité (à partir des fiches de suivi)'
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

    // Graphique d'évolution (réel, agrégation sur les 6 derniers mois à partir de FicheSuivi.dateSuivi)
    const months: Date[] = [];
    const now = new Date();
    const startOfCurrent = this.startOfMonth(now);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(startOfCurrent);
      d.setMonth(d.getMonth() - i);
      months.push(d);
    }

    const labels = months.map(m => this.formatMonthLabel(m));
    const counts = new Array(labels.length).fill(0);

    for (const suivi of this.fichesSuivi) {
      const raw = (suivi as any).dateSuivi as string | Date | undefined;
      if (!raw) continue;
      const d = new Date(raw);
      if (isNaN(d.getTime())) continue;
      const dMonth = this.startOfMonth(d);
      const idx = months.findIndex(m => m.getFullYear() === dMonth.getFullYear() && m.getMonth() === dMonth.getMonth());
      if (idx >= 0) counts[idx] += 1;
    }

    this.evolutionChartData = {
      labels,
      datasets: [{
        label: 'Fiches de suivi par mois',
        data: counts,
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

  private calculerConformiteDepuisSuivi(): { nbConformes: number; totalEvalues: number } {
    let nbConformes = 0;
    let totalEvalues = 0;
    for (const suivi of this.fichesSuivi) {
      const taux = (suivi as any).tauxConformite as number | undefined;
      let valeur: number | null = null;
      if (typeof taux === 'number') {
        valeur = taux;
      } else {
        const indicateurs = (suivi as any).indicateursKpi as string | undefined;
        valeur = indicateurs ? this.extraireTauxConformite(indicateurs.toLowerCase()) : null;
      }
      if (valeur === null || valeur === undefined) continue;
      totalEvalues += 1;
      if (valeur >= 80) nbConformes += 1;
    }
    return { nbConformes, totalEvalues };
  }

  private interpreterIndicateurConformite(indicateursKpi?: string, etatAvancement?: string): boolean | null {
    const text = (indicateursKpi || '').toLowerCase().trim();
    // 0) Extraction ciblée du "taux de conformité" pour éviter de lire le délai
    const taux = this.extraireTauxConformite(text);
    if (taux !== null) {
      return taux >= 80; // seuil par défaut 80%
    }
    // 1) Si aucune valeur explicite de taux, ne pas évaluer (évite les 100% fake)
    return null;
  }

  private extraireTauxConformite(text: string): number | null {
    // Variantes possibles: tauxConformite, taux_conformite, taux de conformite|conformité
    // a) JSON key-like: "tauxConformite": 85 or 85%
    let m = text.match(/taux\s*[_-]?\s*conform(?:ite|ité)\s*"?\s*:\s*(\d{1,3})\s*%?/);
    if (m) {
      const v = Number(m[1]);
      if (!isNaN(v)) return Math.max(0, Math.min(100, v));
    }
    // b) Label + pourcentage: "taux de conformité ... 85%"
    m = text.match(/taux\s*(?:de)?\s*conform(?:ite|ité)[^\d%]{0,30}(\d{1,3})\s*%/);
    if (m) {
      const v = Number(m[1]);
      if (!isNaN(v)) return Math.max(0, Math.min(100, v));
    }
    // c) Label + décimal: "taux de conformité ... 0.85"
    m = text.match(/taux\s*(?:de)?\s*conform(?:ite|ité)[^\d.]{0,30}(0?\.\d+|1(?:\.0+)?)\b/);
    if (m) {
      const v = Number(m[1]);
      if (!isNaN(v)) return Math.max(0, Math.min(100, v * 100));
    }
    return null;
  }

  private extraireDelaiTraitement(text: string): number | null {
    const t = (text || '').toLowerCase();
    // a) "délai de traitement: 15 jours" ou "delai ... 15 j"
    let m = t.match(/delai[^\d]{0,20}(\d{1,3}(?:[.,]\d+)?)\s*(j|jours|jour)?/);
    if (m) {
      const v = Number(m[1].replace(',', '.'));
      if (!isNaN(v)) return v;
    }
    // b) "traitement ... 12 jours"
    m = t.match(/traitement[^\d]{0,20}(\d{1,3}(?:[.,]\d+)?)\s*(j|jours|jour)?/);
    if (m) {
      const v = Number(m[1].replace(',', '.'));
      if (!isNaN(v)) return v;
    }
    // c) nombres isolés suivis de j/jours quand le contexte est court
    m = t.match(/(\d{1,3}(?:[.,]\d+)?)\s*(j|jours|jour)\b/);
    if (m) {
      const v = Number(m[1].replace(',', '.'));
      if (!isNaN(v)) return v;
    }
    return null;
  }

  private calculerDelaiMoyen(): number {
    // Délai moyen basé sur FicheSuivi.delaiTraitementJours
    const delais: number[] = [];
    for (const suivi of this.fichesSuivi) {
      const v = (suivi as any).delaiTraitementJours as number | undefined;
      if (typeof v === 'number' && v >= 0) delais.push(v);
    }
    if (delais.length === 0) return 0;
    const somme = delais.reduce((acc, n) => acc + n, 0);
    return somme / delais.length;
  }

  private normaliserStatut(statut: string | undefined | null): string {
    if (!statut) return '';
    const s = statut
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // enlever accents
      .toUpperCase()
      .replace(/\s+/g, '_');
    if (s.includes('EN_COURS') || s.includes('ENCOURS')) return 'EN_COURS';
    if (s.includes('TERMINE')) return 'TERMINE';
    if (s.includes('BLOQUE')) return 'BLOQUE';
    return s;
  }

  private isFicheBloquee(fiche: FicheQualite): boolean {
    const statutFiche = this.normaliserStatut(fiche.statut);
    if (statutFiche === 'BLOQUE') return true;
    const suivisAssocies = this.fichesSuivi.filter(s => ((s as any).ficheId || '').toString().trim() === (fiche.id || '').toString().trim());
    for (const s of suivisAssocies) {
      const etat = this.normaliserStatut((s as any).etatAvancement as string | undefined);
      if (etat === 'BLOQUE') return true;
    }
    return false;
  }

  getFichesRecentes(): FicheQualite[] {
    // Retourne les 5 premières fiches (sans tri par date car dateCreation n'existe plus)
    return this.fichesQualite.slice(0, 5);
  }

  getFichesBloquees(): FicheQualite[] {
    const bloquees = this.fichesQualite.filter(f => this.isFicheBloquee(f));
    for (const fiche of bloquees) {
      (fiche as any).raisonRetard = 'Statut bloqué';
    }
    return bloquees;
  }

  getFichesEnRetard(): FicheQualite[] {
    // Retourner toutes les fiches dont le délai max dépasse le seuil (hors BLOQUE)
    const candidats: FicheQualite[] = [];
    for (const fiche of this.fichesQualite) {
      const statut = this.normaliserStatut(fiche.statut);
      if (this.isFicheBloquee(fiche)) continue; // gérées dans "Fiches Bloquées"
      const delaiMax = fiche.id ? this.getDelaiMax(fiche.id) : 0;
      if (delaiMax > this.retardThresholdDays) {
        (fiche as any).raisonRetard = `Délai élevé (${delaiMax} jours)`;
        candidats.push(fiche);
      }
    }
    return candidats
      .sort((a, b) => {
        const da = a.id ? this.getDelaiMax(a.id) : 0;
        const db = b.id ? this.getDelaiMax(b.id) : 0;
        return db - da;
      });
  }

  private startOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private formatMonthLabel(date: Date): string {
    const month = date.getMonth();
    switch (month) {
      case 0: return 'Jan';
      case 1: return 'Fév';
      case 2: return 'Mar';
      case 3: return 'Avr';
      case 4: return 'Mai';
      case 5: return 'Juin';
      case 6: return 'Juil';
      case 7: return 'Août';
      case 8: return 'Sep';
      case 9: return 'Oct';
      case 10: return 'Nov';
      case 11: return 'Déc';
      default: return '';
    }
  }

  private getDelaiMax(ficheId: string): number {
    const idRef = (ficheId || '').toString().trim();
    const suivis = this.fichesSuivi.filter(s => ((s as any).ficheId || '').toString().trim() === idRef);
    const delais: number[] = [];
    for (const s of suivis) {
      const brut = (s as any).delaiTraitementJours as unknown;
      let valeur: number | null = null;
      if (brut !== undefined && brut !== null) {
        if (typeof brut === 'number') {
          valeur = brut;
        } else {
          const parsed = Number(brut.toString().replace(',', '.'));
          if (!isNaN(parsed)) valeur = parsed;
        }
      }
      if (valeur === null) {
        const ind = (s as any).indicateursKpi as string | undefined;
        if (ind) {
          const parsedDelay = this.extraireDelaiTraitement(ind);
          if (parsedDelay !== null) valeur = parsedDelay;
        }
      }
      if (typeof valeur === 'number' && valeur > 0) delais.push(valeur);
    }
    return delais.length > 0 ? Math.max(...delais) : 0;
  }

  getDelaiMaxPublic(fiche: FicheQualite): number {
    return fiche?.id ? this.getDelaiMax(fiche.id) : 0;
  }

  getDelayChipColor(days: number): 'primary' | 'accent' | 'warn' {
    if (days >= this.retardThresholdDays * 2) return 'warn';
    if (days >= this.retardThresholdDays) return 'accent';
    return 'primary';
  }
} 