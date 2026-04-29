# Manuel de Formation - Plateforme MRS Lubricants 🚜🛢️

Ce manuel détaille le **flux de données** opérationnel. Suivez ces étapes avec les **données test** fournies pour maîtriser l'application. Les noms des champs correspondent exactement à ceux des formulaires.

---

## 🛠️ ÉTAPE 1 : Configuration & Référentiel (Admin)
*Initialisation de la base de données.*

### 1.1 Créer un Membre de l'Équipe
- **Action** : Menu "Utilisateurs" ➔ Bouton "Ajouter un membre".
- **Données Test** :
    - `Nom Complet` : Marc KOFFI
    - `Email professionnel` : m.koffi@mrs.bj
    - `Rôle` : COMMERCIAL
    - `Téléphone` : +229 90 00 00 01
    - `Mot de passe provisoire` : MRS2026!
- **Résultat** : Un profil est créé. Marc peut désormais se connecter et sera assignable à des clients.

### 1.2 Ajouter un Produit au Catalogue
- **Action** : Menu "Produits" ➔ Bouton "Ajouter un produit".
- **Données Test** :
    - `Code Produit` : MRS-SYN5
    - `Viscosité` : 5W40
    - `Nom Complet` : MRS Synthétique Premium 5L
    - `Taille` : 5 | `Unité` : L
    - `Catégorie` : Huile Moteur
    - `Prix Achat` : 18 500
    - `Prix Vente Sugg.` : 25 000
- **Résultat** : Le produit apparaît dans le catalogue. Il est prêt à être réceptionné en stock.

### 1. Création du Réseau Terrain (Partenaires)
*   **Menu** : `Partenaires` -> `Nouveau partenaire`
*   **Données Test** :
    *   **Enseigne** : Garage du Progrès
    *   **Gérant** : M. Jean Agbo
    *   **Plafond Stock** : `500` (Nombre total d'unités autorisées en stock)
    *   **Commission** : `5%`
*   **Action** : Cliquez sur `Capturer GPS Terrain` devant l'établissement.
*   **Résultat** : Le partenaire est créé avec son entrepôt virtuel prêt à recevoir du stock.

---

## 📦 ÉTAPE 2 : Flux des Stocks (Gestion Logistique)
*Mouvement physique et numérique des lubrifiants.*

### 2.1 Réceptionner le Stock Central
- **Action** : Menu "Stocks" ➔ Bouton "Réceptionner Stock".
- **Données Test** :
    - `Produit reçu` : MRS Synthétique Premium 5L
    - `Quantité (Bidons)` : 500
    - `Valeur Unitaire (Prix Achat)` : 18 500
    - `Référence / Bordereau` : ARRIVEE-2026-001
- **Résultat** : Le stock de l'entrepôt **Central** passe à 500 unités.

### 2.2 Transférer vers un Partenaire (Livraison)
- **Action** : Menu "Livraisons" ➔ Créer un BL.
- **Données Test** :
    - `Source` : Dépôt Central ➔ `Destination` : Garage Moderne Cotonou
    - `Produit` : MRS Synthétique Premium 5L | `Quantité` : 50
- **Résultat** : Le stock central descend à 450. 50 bidons passent en statut **"Pending"** (En route).
- **Validation** : Une fois livré, le Manager clique sur "Confirmer Réception" sur le BL. Le stock est alors officiellement "Déposé" chez le partenaire.

---

## 💰 ÉTAPE 3 : Ventes & Recouvrement
*Génération du Chiffre d'Affaires.*

### 3.1 Déclarer une Vente de Terrain (par Inventaire)
> ⚠️ **La déclaration se fait dans le menu `Ventes`, PAS dans Partenaires.**
> Le principe est simple : vous comptez le stock restant chez le partenaire, l'application calcule automatiquement ce qui a été vendu.

- **Action** : Menu **`Ventes`** ➔ Bouton doré **"🛒 Nouvelle Vente"** (en haut à droite).
- **Vous arrivez sur la page `/dashboard/sales/new`** :
- **Champ `Partenaire`** : Sélectionner `Garage Moderne Cotonou`
- **Champ `Inventaire restant`** (ex: vous comptez 45 bidons sur place) :
    - `Produit` : MRS Synthétique Premium 5L
    - `Stock restant compté` : 45 (Pour chaque produit, vous saisissez le stock restant compté (pas la quantité vendue))
- **`Calcul automatique`** : 50 (stock précédent) – 45 (compté) = **5 vendus**
- **Champ `Mode de paiement`** : Crédit (30 jours)
- **Résultat** :
    - Le stock du partenaire descend de 50 à 45 ✅
    - Une Facture `FAC-XXX` est créée (5 × 25 000 = 125 000 FCFA) ✅
    - Une commission de 6 250 FCFA (5%) est réservée pour le commercial assigné ✅

### 3.2 Enregistrer un Règlement
- **Action** : Menu **`Encaissements`** ➔ Trouver la facture ➔ Bouton **"Ajouter un paiement"**.
- **Données Test** : `Montant` : 125 000 | `Référence` : Mobile Money #12345
- **Résultat** : La facture est marquée comme **Payée**. Le solde du partenaire est mis à jour.

---

## 🔍 ÉTAPE 4 : Audit & Notifications
*Contrôle et supervision.*

- **Savoir** : Cliquez sur la **Cloche** (Header) pour voir si le stock d'un partenaire est bas.
- **Expertise** : Menu **Audit** ➔ Cliquez sur l'icône **Détail**.
- **Action Test** : Allez modifier le nom d'un produit, puis regardez l'Audit.
- **Résultat** : Vous verrez "Nom Initial" ➔ "Nom Modifié" avec l'heure exacte.

---
*Fin du guide opérationnel - MRS Bénin S.A.*
