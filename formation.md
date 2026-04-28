# Manuel de Formation - Plateforme MRS Lubricants 🚜🛢️

Ce guide détaille le processus d'utilisation de l'application de A à Z, en respectant l'ordre logique des opérations métier.

---

## 🏗️ ÉTAPE 1 : Configuration Initiale (À faire en premier)
*Rôle : Administrateur*

Avant toute opération, la base de données doit être configurée dans cet ordre précis :

1.  **Gestion des Utilisateurs** : Créer les comptes pour les Magasiniers, Commerciaux et Managers.
2.  **Entrepôts & Camions** : Créer l'Entrepôt Central ("CENTRAL") et les entrepôts mobiles ("TRUCK") liés à chaque commercial.
3.  **Catalogue Produits** : Enregistrer les lubrifiants avec leur **Prix d'Achat** (pour le calcul des marges) et leur **Prix de Vente**.
4.  **Objectifs Commerciaux** : Dans le Dashboard, définir les objectifs mensuels (en FCFA) pour chaque commercial.

---

## 📦 ÉTAPE 2 : Gestion des Stocks & Logistique
*Rôle : Magasinier / Administrateur*

L'application ne permet pas de vendre ce qui n'est pas en stock.

1.  **Réception de Stock** : Enregistrer l'arrivée des produits dans l'entrepôt Central.
2.  **Création de Livraison** : Créer une livraison pour transférer des produits du Central vers le Camion d'un commercial.
3.  **Confirmation de Réception** : Le commercial doit confirmer la réception sur son interface mobile pour que le stock soit officiellement ajouté à son camion.

---

## 🤝 ÉTAPE 3 : Activité Terrain
*Rôle : Commercial*

1.  **Création de Partenaire** : Lors de la visite d'un nouveau client, créer sa fiche.
    *   *Important* : L'application capture automatiquement les coordonnées GPS. Cliquez sur "Voir sur Maps" pour vérifier la précision.
2.  **Prise de Commande (Vente)** : Enregistrer la vente depuis la fiche du partenaire.
    *   Préciser si c'est une vente au comptant ou à crédit.
    *   L'application génère automatiquement une facture.

---

## 💰 ÉTAPE 4 : Recouvrement & Commissions
*Rôle : Commercial / Administrateur*

1.  **Encaissement** : Si la vente est à crédit, enregistrer les paiements au fur et à mesure.
2.  **Validation des Commissions** : L'administrateur examine les ventes "Validées" et approuve les commissions calculées.
3.  **Règlement des Commissions** : Une fois validées, les commissions sont marquées comme "Payées" après le versement effectif au commercial.

---

## 📊 ÉTAPE 5 : Analyse & Reporting (À faire en dernier)
*Rôle : Manager / Administrateur*

C'est l'étape finale pour le pilotage de l'activité :

1.  **Tableau de Bord** : Suivre en temps réel :
    *   Le Chiffre d'Affaires Net.
    *   La Marge Brute (CA - Coût d'Achat).
    *   Le Taux d'atteinte des objectifs mensuels.
2.  **Exports CSV** : Exporter les listes de ventes ou de partenaires pour des rapports externes.
3.  **Inventaire Physique** : Utiliser la page "Stocks" et le bouton d'impression pour générer une fiche de comptage papier pour les audits de fin de mois.

---

## 🛡️ RÈGLES D'OR
1.  **Zéro Suppression** : On ne supprime rien. Si une erreur est faite, on utilise les journaux de litiges (Discrepancy Logs) ou on annule via une opération inverse.
2.  **GPS Obligatoire** : Assurez-vous que la localisation est activée sur mobile pour la création de partenaires.
3.  **Traitement des Litiges** : Tout écart lors d'une livraison doit être documenté immédiatement dans le module "Litiges".

---
*Document généré le 28/04/2026 pour MRS Bénin S.A.*
