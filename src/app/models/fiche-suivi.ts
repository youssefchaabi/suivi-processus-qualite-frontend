export interface FicheSuivi {
  id?: string;
  ficheId: string;
  dateSuivi: Date;
  etatAvancement: string;
  problemes: string;
  decisions: string;
  indicateursKpi: string;
  tauxConformite?: number; // 0-100
  delaiTraitementJours?: number; // >= 0
  ajoutePar: string;
}