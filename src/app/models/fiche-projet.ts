export interface FicheProjet {
  id?: string;
  nom: string;
  description: string;
  objectifs: string;
  responsable: string;
  echeance: Date;
  statut: string;
  dateCreation?: Date;
  dateDerniereModification?: Date;
  creePar?: string;
} 