export interface FicheQualite {
  id?: string;
  titre: string;
  description: string;
  typeFiche: string;
  statut: string;
  creePar: string;
  responsable: string;
  commentaire: string;
  dateCreation?: Date;
  dateDerniereModification?: Date;
}