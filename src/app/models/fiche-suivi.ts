export interface FicheSuivi {
  id?: string;
  ficheId: string;
  dateSuivi: Date;
  etatAvancement: string;
  problemes: string;
  decisions: string;
  indicateursKpi: string;
  ajoutePar: string;
}