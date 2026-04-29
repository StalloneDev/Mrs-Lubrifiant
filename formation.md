# Manuel de Formation - Plateforme MRS Lubricants 🚜🛢️

Ce manuel détaille le **flux de données** et les processus opérationnels de l'application MRS Lubricants, de la configuration initiale jusqu'à l'audit final.

---

## 🔄 LE FLUX DE DONNÉES (De A à Z)

L'application suit un cycle de vie strict pour garantir la traçabilité de chaque bidon de lubrifiant :
`Configuration` ➔ `Approvisionnement` ➔ `Distribution` ➔ `Confirmation` ➔ `Vente` ➔ `Recouvrement` ➔ `Audit`

---

## 🛠️ ÉTAPE 1 : Configuration & Référentiel (Admin)
*À faire en tout premier pour initialiser le système.*

1.  **Utilisateurs** : Créer les comptes (ADMIN, MANAGER, COMMERCIAL, DELIVERY).
2.  **Produits** : Enregistrer le catalogue. 
    *   *Note* : Renseigner le **Prix d'achat** pour le calcul automatique des marges bénéficiaires.
3.  **Partenaires** : Créer les fiches clients (Partenaires).
    *   Le système crée automatiquement un **Dépôt Virtuel** pour chaque partenaire.
4.  **Objectifs** : Définir les quotas mensuels sur le dashboard pour le suivi de performance.

---

## 📦 ÉTAPE 2 : Approvisionnement Central (Admin/Manager)
*L'entrée des stocks physiques dans le système.*

1.  **Réception de Stock** : Utiliser le bouton "Réception de Stock" dans le menu Stocks.
2.  **Action** : Enregistrer les quantités arrivées au **Dépôt Central**.
3.  **Résultat** : Le stock central augmente. Aucun produit ne peut être vendu s'il n'est pas passé par ici.

---

## 🚛 ÉTAPE 3 : Distribution & Logistique (Livreur/Commercial)
*Le transfert du stock vers le terrain.*

1.  **Création du BL** : Dans le menu "Livraisons", créer un **Bon de Livraison**.
2.  **Transfert** : Le stock sort du "Central" et passe en mode **"Pending" (En attente/En route)**.
3.  **Livraison Physique** : Le livreur remet les produits au partenaire.
4.  **Confirmation (CRUCIAL)** : Une fois livré, le destinataire (ou le système via une action de confirmation) doit valider la réception.
5.  **Résultat** : Le stock quitte le mode "Pending" et s'ajoute au **Dépôt Virtuel du Partenaire** (Stock en Consignation).

---

## 🏷️ ÉTAPE 4 : Vente & Déclaration (Commercial/Manager)
*La transformation du stock en chiffre d'affaires.*

1.  **Vente** : Aller sur la fiche du Partenaire et cliquer sur "Déclarer une Vente".
2.  **Action** : Choisir les produits vendus parmi le stock disponible chez ce partenaire.
3.  **Facturation** : Le système génère automatiquement une **Facture (FAC)**.
4.  **Stock** : Le stock du partenaire est décrémenté automatiquement.

---

## � ÉTAPE 5 : Recouvrement & Commissions (Finance)
*La gestion de la liquidité.*

1.  **Encaissement** : Enregistrer les paiements reçus (partiels ou totaux).
2.  **Statut** : La facture passe de "Impayée" à "Payée".
3.  **Commissions** : Le système calcule la commission du commercial. Elle doit être **Validée** puis **Payée** via le module Commissions.

---

## � ÉTAPE 6 : Audit & Supervision (Direction)
*Le contrôle permanent.*

1.  **Journal d'Audit** : Consulter le menu "Audit" pour voir **exactement** qui a fait quoi (ex: "Reset de mot de passe", "Modification de prix").
2.  **Notifications** : Surveiller la cloche dans le header pour les alertes de **Stock Bas** ou les **Factures en retard**.
3.  **Ajustements** : Si un bidon est cassé ou perdu, utiliser le dialogue "Ajustement / Retour de Stock" pour régulariser avec une justification obligatoire.

---

## 🛡️ RÈGLES DE SÉCURITÉ
- **Zéro Suppression** : Toute erreur doit être corrigée par une opération inverse ou documentée en litige.
- **Transparence** : Chaque action est logguée avec l'IP et le nom de l'utilisateur.
- **Consignation** : Le stock appartenant à MRS reste visible jusqu'à la vente finale.

---
*Guide d'exploitation - MRS Bénin S.A. - Avril 2026*
