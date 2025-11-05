export interface Tache {
  id?: string;
  titre: string;
  description?: string;
  projetId: string;
  projetNom?: string;
  dateEcheance: Date;
  priorite: PrioriteTache;
  statut: StatutTache;
  creePar: string;
  dateCreation?: Date;
  dateModification?: Date;
}

export enum PrioriteTache {
  HAUTE = 'HAUTE',
  MOYENNE = 'MOYENNE',
  BASSE = 'BASSE'
}

export enum StatutTache {
  A_FAIRE = 'A_FAIRE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  EN_RETARD = 'EN_RETARD'
}

export interface TacheStats {
  total: number;
  aFaire: number;
  enCours: number;
  terminees: number;
  enRetard: number;
  prochaines7Jours: number;
}
