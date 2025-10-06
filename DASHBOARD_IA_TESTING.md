# 🧠 Guide de Test du Dashboard IA

## 📊 **Métriques à Tester et Logique de Calcul**

### **1. Score IA (0-100)**
**Formule :** `(Taux de conformité × 0.4) + (Efficacité processus × 0.3) + (Qualité des données × 0.3)`

**Scénarios de test :**
- **Score élevé (80-100)** : Créez des fiches avec taux de conformité > 80% et délais courts
- **Score moyen (50-79)** : Mélangez des fiches conformes et non conformes
- **Score faible (0-49)** : Créez des fiches avec problèmes (bloquées, délais longs)

**Test pratique :**
1. Créez 5 fiches qualité avec statut "TERMINE"
2. Créez 5 fiches de suivi avec `tauxConformite = 85`
3. Vérifiez que le score IA > 70

### **2. Niveau de Confiance (0-100%)**
**Formule :** `30% (base) + 40% (bonus suivi) + 30% (bonus indicateurs)`

**Scénarios de test :**
- **Confiance élevée (80-100%)** : Beaucoup de fiches avec indicateurs KPI complets
- **Confiance moyenne (50-79%)** : Fiches avec suivi partiel
- **Confiance faible (30-49%)** : Peu de fiches de suivi

**Test pratique :**
1. Créez 10 fiches qualité
2. Créez 10 fiches de suivi avec `indicateursKpi` remplis
3. Vérifiez que la confiance > 80%

### **3. Taux de Conformité Global (0-100%)**
**Formule :** `Moyenne des tauxConformite des fiches de suivi`

**Scénarios de test :**
- **Conformité élevée (80-100%)** : Tous les taux > 80%
- **Conformité moyenne (50-79%)** : Mélange de taux
- **Conformité faible (0-49%)** : Tous les taux < 50%

**Test pratique :**
1. Modifiez les `tauxConformite` dans vos fiches de suivi
2. Vérifiez que le taux global reflète la moyenne

### **4. Efficacité Processus (0-100%)**
**Formule :** `100 - (délai moyen × 2) + (taux conformité × 0.3)`

**Scénarios de test :**
- **Efficacité élevée (80-100%)** : Délais courts + conformité élevée
- **Efficacité moyenne (50-79%)** : Délais moyens
- **Efficacité faible (0-49%)** : Délais longs + conformité faible

**Test pratique :**
1. Modifiez `delaiTraitementJours` dans vos fiches de suivi
2. Vérifiez que l'efficacité diminue avec les délais

### **5. Alertes Critiques (0-4)**
**Déclencheurs :**
- Fiches bloquées > 0
- Taux de conformité < 50%
- Fiches en retard > 0
- Efficacité processus < 40%

**Test pratique :**
1. Créez une fiche avec statut "BLOQUE" → +1 alerte
2. Baissez le taux de conformité < 50% → +1 alerte
3. Créez des fiches avec délai > 15 jours → +1 alerte

### **6. Opportunités d'Optimisation (0-4)**
**Déclencheurs :**
- Taux de conformité < 80%
- Fiches en retard > 0
- Efficacité processus < 70%
- Fiches bloquées > 0

**Test pratique :**
1. Baissez le taux de conformité < 80% → +1 opportunité
2. Créez des fiches en retard → +1 opportunité
3. Baissez l'efficacité < 70% → +1 opportunité

---

## 🧪 **Scénarios de Test Complets**

### **Test 1 : Dashboard Parfait**
**Objectif :** Score IA = 100, Confiance = 100%
**Actions :**
1. Créez 10 fiches qualité avec statut "TERMINE"
2. Créez 10 fiches de suivi avec `tauxConformite = 100`
3. Définissez `delaiTraitementJours = 2` (court)
4. Ajoutez des `indicateursKpi` complets
5. Vérifiez les métriques

### **Test 2 : Dashboard Moyen**
**Objectif :** Score IA = 60-70, Confiance = 60-70%
**Actions :**
1. Créez 5 fiches qualité avec statuts mixtes
2. Créez 5 fiches de suivi avec `tauxConformite = 60`
3. Définissez `delaiTraitementJours = 8` (moyen)
4. Ajoutez quelques `indicateursKpi`
5. Vérifiez les métriques

### **Test 3 : Dashboard Critique**
**Objectif :** Score IA < 40, Alertes > 2
**Actions :**
1. Créez 3 fiches avec statut "BLOQUE"
2. Créez 3 fiches de suivi avec `tauxConformite = 20`
3. Définissez `delaiTraitementJours = 20` (long)
4. Vérifiez les alertes et opportunités

---

## 🔍 **Vérification des Résultats**

### **Console de Debug**
Ouvrez la console du navigateur (F12) pour voir les détails des calculs :
```
=== DÉTAILS DES CALCULS DASHBOARD IA ===
Données de base:
- Fiches Qualité: 10
- Fiches Suivi: 10
- Fiches Projet: 5

Calculs intermédiaires:
- Taux de conformité global: 85.00%
- Efficacité processus: 78.50%
- Fiches en retard: 1
- Fiches bloquées: 0

Calcul Score IA:
- Score conformité (40%): 34.00
- Score efficacité (30%): 23.55
- Score qualité données (30%): 25.00
- Score IA final: 82.55
```

### **Vérifications à Faire**
1. **Cohérence** : Les métriques doivent être logiques entre elles
2. **Réactivité** : Les changements de données doivent se refléter immédiatement
3. **Limites** : Toutes les valeurs doivent être entre 0 et 100
4. **Relations** : Score IA et Confiance doivent être cohérents

---

## 🚨 **Problèmes Courants et Solutions**

### **Problème : Score IA = 100 mais Conformité = 0%**
**Cause :** Données non chargées ou calculs incorrects
**Solution :** Vérifiez que `fichesSuivi` contient des données avec `tauxConformite`

### **Problème : Confiance = 0%**
**Cause :** Pas de fiches de suivi ou indicateurs manquants
**Solution :** Créez des fiches de suivi avec `indicateursKpi`

### **Problème : Métriques ne changent pas**
**Cause :** Auto-refresh désactivé ou données en cache
**Solution :** Cliquez sur "Actualiser maintenant" ou activez l'auto-refresh

---

## 📝 **Checklist de Test**

- [ ] Score IA calcule correctement (0-100)
- [ ] Niveau de confiance reflète la qualité des données
- [ ] Taux de conformité basé sur les fiches de suivi
- [ ] Efficacité processus diminue avec les délais
- [ ] Alertes critiques se déclenchent correctement
- [ ] Opportunités d'optimisation sont logiques
- [ ] Filtres fonctionnent sans recharger les données
- [ ] Auto-refresh peut être activé/désactivé
- [ ] Bouton d'actualisation manuelle fonctionne
- [ ] Console affiche les détails des calculs

---

## 🎯 **Objectifs de Test**

1. **Compréhension** : Comprendre comment chaque métrique est calculée
2. **Validation** : Vérifier que les calculs sont logiques et cohérents
3. **Performance** : Tester la réactivité et la précision des analyses
4. **Utilisabilité** : Vérifier que l'interface est intuitive et informative

**Note :** Ce dashboard utilise vos données réelles pour fournir des insights intelligents. Plus vos données sont complètes et cohérentes, plus les analyses IA seront précises et utiles !

