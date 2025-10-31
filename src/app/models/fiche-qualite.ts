export interface FicheQualite {
  id?: string;
  titre: string;
  description: string;
  typeFiche: string;
  statut: string;
  categorie?: string;
  priorite?: string;
  responsable: string;
  dateEcheance: Date | string;
  observations?: string;
  commentaire?: string;
  dateCreation?: Date | string;
  dateModification?: Date | string;
}