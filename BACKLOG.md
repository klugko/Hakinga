# Hakinga - Backlog Complet et Exhaustif

## Vue d'Ensemble du Produit

**Hakinga** est une plateforme intelligente d'entraînement à la dactylographie qui combine gameplay compétitif et apprentissage personnalisé par Machine Learning. L'application vise à améliorer la vitesse, la précision et la consistance de frappe à travers la compétition, la pratique et un feedback intelligent basé sur les données.

**Stack Technique:**
- Frontend: TypeScript, Vite, ReactJS, TailwindCSS
- Backend: FastAPI (Python)
- Database: PostgreSQL
- Auth: JWT (email + password uniquement)
- Design: Dark mode exclusivement

---

## EPIC 1: Authentication & User Management

### Feature 1.1: Système d'Authentification JWT

#### US-1.1.1: Inscription Utilisateur
**En tant que** visiteur  
**Je veux** créer un compte avec email et mot de passe  
**Afin de** pouvoir utiliser l'application

**Critères d'acceptation:**
- Le formulaire d'inscription contient: email, username, password, password confirmation
- L'email doit être unique dans le système
- Le username doit être unique (3-20 caractères, alphanumeric + underscore)
- Le mot de passe doit respecter: min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
- La confirmation de mot de passe doit correspondre
- Un email de vérification est envoyé (stocké pour validation future)
- Un JWT token est généré et retourné après inscription réussie
- Les erreurs de validation sont affichées clairement en français
- Design dark avec feedback visuel clair

**Tâches techniques:**
- [ ] Frontend: Créer le composant RegistrationForm avec validation côté client
- [ ] Frontend: Implémenter la gestion d'état pour le formulaire (React Hook Form)
- [ ] Frontend: Créer les composants d'erreur et de succès
- [ ] Backend: Endpoint POST /api/auth/register
- [ ] Backend: Validation des données avec Pydantic
- [ ] Backend: Hachage du mot de passe (bcrypt)
- [ ] Backend: Génération du JWT token
- [ ] Database: Table `users` avec champs: id, email, username, password_hash, created_at, updated_at, email_verified
- [ ] Backend: Service d'envoi d'email (configuration SMTP)

#### US-1.1.2: Connexion Utilisateur
**En tant que** utilisateur enregistré  
**Je veux** me connecter avec mon email et mot de passe  
**Afin d'** accéder à mon compte

**Critères d'acceptation:**
- Le formulaire contient: email et password
- La validation est effectuée côté serveur
- Un JWT token valide est retourné en cas de succès
- Le token a une durée de vie de 24h
- Un refresh token est généré (durée: 30 jours)
- Les erreurs sont affichées: "Email ou mot de passe incorrect"
- Le token est stocké de manière sécurisée (httpOnly cookie ou localStorage avec encryption)
- Redirection automatique vers le dashboard après connexion

**Tâches techniques:**
- [ ] Frontend: Composant LoginForm
- [ ] Frontend: Gestion du stockage sécurisé du token
- [ ] Frontend: Intercepteur HTTP pour ajouter le token aux requêtes
- [ ] Backend: Endpoint POST /api/auth/login
- [ ] Backend: Vérification des credentials
- [ ] Backend: Génération JWT access + refresh tokens
- [ ] Backend: Middleware d'authentification pour les routes protégées
- [ ] Database: Table `refresh_tokens` (token_hash, user_id, expires_at, created_at)

#### US-1.1.3: Déconnexion
**En tant que** utilisateur connecté  
**Je veux** me déconnecter  
**Afin de** sécuriser mon compte

**Critères d'acceptation:**
- Bouton de déconnexion accessible depuis la navigation
- Le token est invalidé côté serveur (blacklist)
- Le token est supprimé côté client
- Redirection vers la page d'accueil
- Confirmation visuelle de déconnexion

**Tâches techniques:**
- [ ] Frontend: Bouton de déconnexion dans le header
- [ ] Frontend: Action de nettoyage du state et du storage
- [ ] Backend: Endpoint POST /api/auth/logout
- [ ] Backend: Ajout du token à une blacklist (Redis ou table DB)
- [ ] Database: Table `token_blacklist` (token_hash, expires_at)

#### US-1.1.4: Rafraîchissement du Token
**En tant que** utilisateur connecté  
**Je veux** que ma session soit prolongée automatiquement  
**Afin de** ne pas avoir à me reconnecter constamment

**Critères d'acceptation:**
- Le refresh token permet d'obtenir un nouveau access token
- Le refresh token est valide 30 jours
- L'ancien access token est invalidé après refresh
- Le processus est transparent pour l'utilisateur
- Si le refresh token expire, l'utilisateur est déconnecté

**Tâches techniques:**
- [ ] Frontend: Intercepteur pour détecter les erreurs 401
- [ ] Frontend: Logic de refresh automatique du token
- [ ] Backend: Endpoint POST /api/auth/refresh
- [ ] Backend: Validation et rotation du refresh token

#### US-1.1.5: Récupération de Mot de Passe
**En tant que** utilisateur ayant oublié son mot de passe  
**Je veux** pouvoir le réinitialiser  
**Afin de** retrouver l'accès à mon compte

**Critères d'acceptation:**
- Page "Mot de passe oublié" avec champ email
- Email de réinitialisation envoyé avec lien unique et temporaire (1h de validité)
- Page de réinitialisation avec nouveau mot de passe + confirmation
- Le lien de réinitialisation est à usage unique
- Confirmation de succès après changement

**Tâches techniques:**
- [ ] Frontend: Page ForgotPassword
- [ ] Frontend: Page ResetPassword avec validation
- [ ] Backend: Endpoint POST /api/auth/forgot-password
- [ ] Backend: Endpoint POST /api/auth/reset-password
- [ ] Backend: Génération de token de réinitialisation sécurisé
- [ ] Database: Table `password_reset_tokens` (token_hash, user_id, expires_at, used)
- [ ] Backend: Template email de réinitialisation

### Feature 1.2: Profil Utilisateur

#### US-1.2.1: Voir Mon Profil
**En tant que** utilisateur connecté  
**Je veux** consulter mon profil  
**Afin de** voir mes informations et statistiques

**Critères d'acceptation:**
- Page profil affichant: username, email, date d'inscription
- Section statistiques globales:
  - WPM moyen
  - Précision moyenne
  - Nombre total de sessions
  - Temps total de pratique
  - Meilleur WPM
  - Progression sur 7/30 jours
- Graphique d'évolution du WPM dans le temps
- Liste des dernières sessions (10 max) avec détails
- Design dark avec visualisations claires

**Tâches techniques:**
- [ ] Frontend: Page ProfileView
- [ ] Frontend: Composant StatisticsCard (réutilisable)
- [ ] Frontend: Graphique d'évolution (Chart.js ou Recharts)
- [ ] Frontend: Liste des sessions récentes
- [ ] Backend: Endpoint GET /api/users/me/profile
- [ ] Backend: Calcul des statistiques agrégées
- [ ] Backend: Query optimisée pour l'historique
- [ ] Database: Index sur user_id dans les tables de sessions

#### US-1.2.2: Modifier Mon Profil
**En tant que** utilisateur connecté  
**Je veux** modifier mon username  
**Afin de** personnaliser mon identité

**Critères d'acceptation:**
- Formulaire de modification avec username
- Validation de l'unicité du nouveau username
- Pas de modification d'email (sécurité)
- Confirmation avant sauvegarde
- Message de succès après modification
- Les anciennes sessions gardent l'ancien username en historique

**Tâches techniques:**
- [ ] Frontend: Formulaire EditProfile
- [ ] Frontend: Validation temps réel de disponibilité du username
- [ ] Backend: Endpoint PUT /api/users/me/profile
- [ ] Backend: Vérification unicité username
- [ ] Database: Garder un historique des usernames (optionnel)

#### US-1.2.3: Changer Mon Mot de Passe
**En tant que** utilisateur connecté  
**Je veux** changer mon mot de passe  
**Afin de** maintenir la sécurité de mon compte

**Critères d'acceptation:**
- Formulaire avec: ancien mot de passe, nouveau mot de passe, confirmation
- Validation de l'ancien mot de passe
- Validation du nouveau mot de passe (règles de complexité)
- Tous les refresh tokens sont invalidés après changement
- Email de notification de changement de mot de passe
- Message de succès

**Tâches techniques:**
- [ ] Frontend: Formulaire ChangePassword
- [ ] Backend: Endpoint PUT /api/users/me/password
- [ ] Backend: Validation de l'ancien mot de passe
- [ ] Backend: Invalidation des refresh tokens
- [ ] Backend: Email de notification

#### US-1.2.4: Supprimer Mon Compte
**En tant que** utilisateur connecté  
**Je veux** supprimer définitivement mon compte  
**Afin d'** exercer mon droit à l'oubli

**Critères d'acceptation:**
- Bouton "Supprimer mon compte" dans les paramètres
- Modal de confirmation avec saisie du mot de passe
- Warning explicite: "Cette action est irréversible"
- Suppression de toutes les données personnelles
- Les données de sessions sont anonymisées (pas supprimées pour les stats ML)
- Email de confirmation de suppression
- Déconnexion automatique

**Tâches techniques:**
- [ ] Frontend: Modal de confirmation de suppression
- [ ] Backend: Endpoint DELETE /api/users/me
- [ ] Backend: Soft delete ou anonymisation
- [ ] Database: Script d'anonymisation des données
- [ ] Backend: Conformité RGPD

---

## EPIC 2: Mode Solo Practice

### Feature 2.1: Session de Pratique Solo

#### US-2.1.1: Démarrer une Session Solo
**En tant que** utilisateur connecté  
**Je veux** démarrer une session de pratique solo  
**Afin de** m'entraîner à mon rythme

**Critères d'acceptation:**
- Page dédiée "Solo Practice"
- Sélection de difficulté: Facile / Moyen / Difficile
- Sélection de longueur: Court (50 mots) / Moyen (100 mots) / Long (200 mots)
- Option: catégorie de texte (code, prose, technique)
- Bouton "Commencer" qui lance la session
- Le texte est affiché en gris clair sur fond dark
- Le curseur de frappe est clairement visible (clignotant)
- Timer qui démarre au premier caractère tapé

**Tâches techniques:**
- [ ] Frontend: Page SoloPractice
- [ ] Frontend: Composant de sélection de difficulté/longueur
- [ ] Frontend: Composant TypingArea (réutilisable)
- [ ] Frontend: Timer avec hooks
- [ ] Backend: Endpoint POST /api/sessions/solo/start
- [ ] Backend: Sélection aléatoire de texte selon critères
- [ ] Database: Table `texts` (id, content, difficulty, category, word_count, language)
- [ ] Database: Précharger des textes de différentes difficultés

#### US-2.1.2: Taper le Texte en Temps Réel
**En tant que** utilisateur en session solo  
**Je veux** voir mes frappes apparaître en temps réel  
**Afin de** suivre ma progression

**Critères d'acceptation:**
- Les caractères corrects apparaissent en blanc/vert
- Les caractères incorrects apparaissent en rouge
- Le caractère actuel à taper est surligné
- Le texte scroll automatiquement si nécessaire
- Les espaces sont matérialisés visuellement
- Le curseur suit la position actuelle
- Aucun copier-coller n'est possible
- Les raccourcis clavier sont désactivés
- Chaque frappe est enregistrée avec timestamp

**Tâches techniques:**
- [ ] Frontend: Gestionnaire d'événements clavier (onKeyDown)
- [ ] Frontend: Logique de comparaison caractère par caractère
- [ ] Frontend: Mise à jour du style des caractères en temps réel
- [ ] Frontend: Désactivation du copier-coller
- [ ] Frontend: Collection des keystroke data:
  - timestamp
  - key pressed
  - expected key
  - is_correct
  - time_since_last_key
- [ ] Frontend: Buffer local des données avant envoi au backend

#### US-2.1.3: Terminer la Session et Voir les Résultats
**En tant que** utilisateur ayant terminé une session solo  
**Je veux** voir mes résultats détaillés  
**Afin de** mesurer ma performance

**Critères d'acceptation:**
- Les résultats s'affichent automatiquement après le dernier caractère
- Affichage de:
  - WPM (mots par minute)
  - Précision (%)
  - Nombre d'erreurs
  - Durée totale
  - Graphique de vitesse dans le temps (WPM par segment)
  - Caractères problématiques (top 5)
- Bouton "Refaire" pour recommencer avec un nouveau texte
- Bouton "Retour au menu"
- Les données sont sauvegardées dans l'historique

**Tâches techniques:**
- [ ] Frontend: Page SessionResults (réutilisable)
- [ ] Frontend: Calcul des métriques côté client
- [ ] Frontend: Graphique de vitesse
- [ ] Frontend: Liste des erreurs fréquentes
- [ ] Backend: Endpoint POST /api/sessions/solo/complete
- [ ] Backend: Sauvegarde de la session complète
- [ ] Backend: Sauvegarde des keystroke data pour ML
- [ ] Database: Table `sessions` (id, user_id, session_type, text_id, wpm, accuracy, duration, errors_count, completed_at)
- [ ] Database: Table `keystrokes` (id, session_id, timestamp, key_pressed, expected_key, is_correct, time_since_last)

#### US-2.1.4: Abandonner une Session
**En tant que** utilisateur en session solo  
**Je veux** pouvoir abandonner la session  
**Afin de** la recommencer ou quitter

**Critères d'acceptation:**
- Bouton "Abandonner" visible pendant la session
- Modal de confirmation "Êtes-vous sûr ?"
- La session abandonnée est marquée comme "incomplete"
- Les données partielles sont sauvegardées pour analyse ML
- Redirection vers le menu solo

**Tâches techniques:**
- [ ] Frontend: Bouton d'abandon + modal
- [ ] Backend: Endpoint POST /api/sessions/solo/abandon
- [ ] Database: Champ `status` dans sessions (completed, abandoned, in_progress)

### Feature 2.2: Historique de Pratique

#### US-2.2.1: Consulter Mon Historique de Sessions Solo
**En tant que** utilisateur connecté  
**Je veux** voir l'historique de mes sessions solo  
**Afin de** suivre ma progression

**Critères d'acceptation:**
- Page dédiée "Historique"
- Liste paginée des sessions (20 par page)
- Pour chaque session: date, WPM, précision, durée, difficulté
- Filtres: date (7j, 30j, tout), difficulté
- Tri: date (décroissant par défaut), WPM, précision
- Possibilité de voir le détail d'une session spécifique

**Tâches techniques:**
- [ ] Frontend: Page SessionHistory
- [ ] Frontend: Composant SessionCard
- [ ] Frontend: Filtres et tri
- [ ] Frontend: Pagination
- [ ] Backend: Endpoint GET /api/sessions/solo/history
- [ ] Backend: Query avec filtres, tri, pagination
- [ ] Database: Index sur (user_id, completed_at)

#### US-2.2.2: Voir le Détail d'une Session Passée
**En tant que** utilisateur connecté  
**Je veux** revoir le détail d'une session passée  
**Afin d'** analyser mes erreurs

**Critères d'acceptation:**
- Page de détail affichant toutes les métriques
- Le texte avec visualisation des erreurs commises (caractères en rouge)
- Graphique de vitesse dans le temps
- Liste des erreurs par type
- Recommandations basiques: "Travaillez ces caractères: e, r, t"

**Tâches techniques:**
- [ ] Frontend: Page SessionDetail
- [ ] Frontend: Reconstruction visuelle du texte avec erreurs
- [ ] Frontend: Graphique de vitesse
- [ ] Backend: Endpoint GET /api/sessions/:sessionId
- [ ] Backend: Récupération des keystroke data pour visualisation

---

## EPIC 3: Mode Session Privée (Amis)

### Feature 3.1: Création et Gestion de Session Privée

#### US-3.1.1: Créer une Session Privée
**En tant que** utilisateur connecté  
**Je veux** créer une session privée  
**Afin de** jouer avec mes amis

**Critères d'acceptation:**
- Page "Créer une session privée"
- Configuration de la session:
  - Difficulté du texte
  - Longueur du texte
  - Nombre maximum de participants (2-10)
- Génération d'un lien d'invitation unique
- Le créateur devient l'hôte de la session
- La session est en attente de joueurs
- Affichage du lien à copier
- Bouton "Copier le lien"
- Compteur de joueurs connectés en temps réel

**Tâches techniques:**
- [ ] Frontend: Page CreatePrivateSession
- [ ] Frontend: Formulaire de configuration
- [ ] Frontend: Affichage du lien avec bouton de copie
- [ ] Frontend: Liste des joueurs en attente (WebSocket)
- [ ] Backend: Endpoint POST /api/sessions/private/create
- [ ] Backend: Génération d'un code unique (8 caractères alphanumériques)
- [ ] Backend: WebSocket pour la synchronisation des joueurs
- [ ] Database: Table `private_sessions` (id, host_user_id, session_code, text_id, max_participants, status, created_at)
- [ ] Database: Table `private_session_participants` (session_id, user_id, joined_at, ready_status)

#### US-3.1.2: Rejoindre une Session Privée via Lien
**En tant que** utilisateur connecté  
**Je veux** rejoindre une session privée via un lien  
**Afin de** jouer avec mes amis

**Critères d'acceptation:**
- Clic sur le lien redirige vers la page de la session
- Si non connecté: redirection vers login puis vers la session
- Vérification que la session existe et n'est pas pleine
- Vérification que la session n'a pas déjà démarré
- Affichage de la salle d'attente avec liste des joueurs
- Bouton "Prêt" pour indiquer qu'on est prêt à commencer
- L'hôte voit qui est prêt (indicateur visuel vert)

**Tâches techniques:**
- [ ] Frontend: Route dynamique /session/:code
- [ ] Frontend: Page PrivateSessionLobby
- [ ] Frontend: Liste des participants avec statut "prêt"
- [ ] Frontend: Bouton "Prêt" qui change de couleur
- [ ] Frontend: WebSocket pour synchronisation en temps réel
- [ ] Backend: Endpoint GET /api/sessions/private/:code/join
- [ ] Backend: Validation de la session (existe, pas pleine, pas démarrée)
- [ ] Backend: Ajout du participant
- [ ] Backend: Broadcast WebSocket à tous les participants

#### US-3.1.3: Démarrer la Course (Hôte)
**En tant qu'** hôte de la session  
**Je veux** démarrer la course quand tout le monde est prêt  
**Afin que** tous commencent en même temps

**Critères d'acceptation:**
- Bouton "Démarrer la course" visible uniquement pour l'hôte
- Le bouton est actif seulement si au moins 2 joueurs sont prêts
- Compte à rebours de 3 secondes envoyé à tous les participants
- Le texte apparaît en même temps pour tous
- Le timer démarre au premier caractère tapé par chaque joueur
- Si un joueur se déconnecte, il est marqué comme "abandonné"

**Tâches techniques:**
- [ ] Frontend: Bouton "Démarrer" (conditionnel hôte)
- [ ] Frontend: Composant Countdown (3, 2, 1, GO!)
- [ ] Frontend: WebSocket listener pour le signal de démarrage
- [ ] Backend: Endpoint POST /api/sessions/private/:code/start
- [ ] Backend: Validation que l'utilisateur est l'hôte
- [ ] Backend: Changement du status de la session en "in_progress"
- [ ] Backend: Broadcast du signal de démarrage + countdown
- [ ] Database: Mise à jour du champ `status` et `started_at`

### Feature 3.2: Course en Temps Réel

#### US-3.2.1: Voir la Progression des Autres Joueurs
**En tant que** participant à une session privée  
**Je veux** voir la progression des autres joueurs en temps réel  
**Afin de** savoir qui est en tête

**Critères d'acceptation:**
- Affichage latéral ou en haut: liste des joueurs avec barres de progression
- Chaque barre indique le % de texte complété
- Les positions sont mises à jour en temps réel (< 500ms de latence)
- Le joueur actuel est mis en évidence
- Affichage du WPM actuel de chaque joueur (optionnel)
- Design responsive: liste compacte sur mobile

**Tâches techniques:**
- [ ] Frontend: Composant LiveRaceLeaderboard
- [ ] Frontend: Barres de progression animées
- [ ] Frontend: WebSocket listener pour les updates de position
- [ ] Frontend: Optimisation des re-renders (React.memo)
- [ ] Backend: WebSocket broadcast de la progression toutes les 500ms
- [ ] Backend: Calcul du % de complétion côté serveur
- [ ] Backend: Throttling des messages pour éviter la surcharge

#### US-3.2.2: Terminer la Course et Voir le Classement
**En tant que** participant ayant terminé  
**Je veux** voir le classement final  
**Afin de** comparer mes performances

**Critères d'acceptation:**
- Dès qu'un joueur termine, son rang final est enregistré
- Affichage d'un écran d'attente: "En attente des autres joueurs..."
- Possibilité de voir les résultats partiels (qui a terminé)
- Quand tous ont terminé OU après 2min timeout: affichage du classement final
- Classement affiche: rang, username, WPM, précision, durée
- Podium visuel (1er, 2e, 3e) avec animation
- Bouton "Refaire une course" (l'hôte peut relancer)
- Bouton "Retour au menu"

**Tâches techniques:**
- [ ] Frontend: Écran d'attente avec liste des joueurs terminés
- [ ] Frontend: Page RaceResults avec podium
- [ ] Frontend: Animations de victoire
- [ ] Backend: Endpoint POST /api/sessions/private/:code/finish
- [ ] Backend: Enregistrement du temps de fin et du rang
- [ ] Backend: Calcul du classement final
- [ ] Backend: Timeout de 2min si certains n'ont pas terminé
- [ ] Backend: Broadcast des résultats finaux
- [ ] Database: Table `private_session_results` (session_id, user_id, rank, wpm, accuracy, duration, finished_at)

#### US-3.2.3: Quitter une Session Privée en Cours
**En tant que** participant  
**Je veux** pouvoir quitter une session en cours  
**Afin de** la rejoindre ou partir si besoin

**Critères d'acceptation:**
- Bouton "Quitter" visible pendant la course
- Pas de confirmation si en course (action rapide)
- Le joueur est marqué comme "abandonné"
- Les autres joueurs voient son statut mis à jour
- Les données partielles sont sauvegardées

**Tâches techniques:**
- [ ] Frontend: Bouton "Quitter"
- [ ] Backend: Endpoint POST /api/sessions/private/:code/leave
- [ ] Backend: Mise à jour du statut du participant
- [ ] Backend: Broadcast de la déconnexion
- [ ] Database: Champ `status` dans private_session_participants (joined, ready, racing, finished, abandoned)

---

## EPIC 4: Mode Compétition Publique

### Feature 4.1: Matchmaking et Lobby Public

#### US-4.1.1: Rejoindre une File d'Attente Publique
**En tant que** utilisateur connecté  
**Je veux** rejoindre une course publique  
**Afin de** me mesurer à d'autres joueurs

**Critères d'acceptation:**
- Page "Compétition Publique"
- Sélection de la difficulté (affecte le matchmaking)
- Bouton "Trouver une course"
- L'utilisateur est ajouté à une file d'attente
- Affichage: "Recherche d'adversaires... X/5 joueurs"
- Notification quand une course est trouvée (son + visuel)
- Redirection automatique vers le lobby de la course
- Temps d'attente max: 60 secondes, sinon démarrage avec les joueurs présents (min 2)

**Tâches techniques:**
- [ ] Frontend: Page PublicCompetition
- [ ] Frontend: Sélecteur de difficulté
- [ ] Frontend: Écran de recherche avec loader
- [ ] Frontend: WebSocket pour les notifications de match trouvé
- [ ] Backend: Endpoint POST /api/sessions/public/queue
- [ ] Backend: Système de matchmaking:
  - Pooling des joueurs par difficulté
  - Constitution de groupes de 5 max
  - Timer de 60s max
- [ ] Backend: Création automatique de la session publique
- [ ] Backend: Assignment du texte (aléatoire selon difficulté)
- [ ] Database: Table `public_sessions` (similaire à private_sessions)
- [ ] Database: Table `public_session_participants`

#### US-4.1.2: Lobby Publique avec Countdown
**En tant que** joueur ayant trouvé une course  
**Je veux** voir les autres joueurs et attendre le démarrage  
**Afin de** me préparer mentalement

**Critères d'acceptation:**
- Écran de lobby affichant les 2-5 joueurs
- Affichage du niveau de chacun (rang/badge si disponible)
- Countdown automatique de 10 secondes
- Impossible d'annuler une fois en lobby (sauf déconnexion)
- Affichage du texte qui sera tapé (preview floutée pour pas tricher)
- Message: "La course démarre dans Xs..."

**Tâches techniques:**
- [ ] Frontend: Page PublicLobby
- [ ] Frontend: Liste des joueurs avec avatars/niveaux
- [ ] Frontend: Countdown automatique
- [ ] Frontend: Preview du texte (flouté)
- [ ] Backend: Broadcast du countdown à tous les participants
- [ ] Backend: Démarrage automatique après countdown

#### US-4.1.3: Annuler la Recherche
**En tant que** joueur en recherche de course  
**Je veux** annuler ma recherche  
**Afin de** ne pas être mis en course

**Critères d'acceptation:**
- Bouton "Annuler" pendant la recherche
- Retrait immédiat de la file d'attente
- Message de confirmation: "Recherche annulée"
- Retour à la page de compétition publique

**Tâches techniques:**
- [ ] Frontend: Bouton "Annuler la recherche"
- [ ] Backend: Endpoint POST /api/sessions/public/cancel-queue
- [ ] Backend: Retrait de la file d'attente

### Feature 4.2: Course Publique et Résultats

#### US-4.2.1: Participer à une Course Publique
**En tant que** joueur en course publique  
**Je veux** taper le texte et voir la progression des autres  
**Afin de** rivaliser en temps réel

**Critères d'acceptation:**
- Interface identique à la session privée
- Affichage du classement en temps réel (latéral)
- WPM et position mis à jour toutes les 500ms
- Possibilité de voir son propre WPM en temps réel
- Animation de dépassement quand on passe un autre joueur
- Son de notification pour les dépassements (optionnel, activable)

**Tâches techniques:**
- [ ] Frontend: Réutilisation du composant de course
- [ ] Frontend: Ajout d'animations de dépassement
- [ ] Frontend: Notification sonore (optionnelle)
- [ ] Backend: Même logique que session privée
- [ ] Backend: Broadcast de la progression

#### US-4.2.2: Voir les Résultats de la Course Publique
**En tant que** joueur ayant terminé une course publique  
**Je veux** voir mon classement et mes points gagnés  
**Afin de** mesurer ma progression

**Critères d'acceptation:**
- Classement final avec podium (top 3)
- Pour chaque joueur: rang, username, WPM, précision
- Attribution de points selon le rang:
  - 1er: +50 points
  - 2e: +30 points
  - 3e: +20 points
  - 4e: +10 points
  - 5e: +5 points
- Affichage des points gagnés: "+50 points 🎉"
- Mise à jour du total de points du joueur
- Bouton "Nouvelle course" qui remet en file d'attente
- Sauvegarde complète de la session pour historique

**Tâches techniques:**
- [ ] Frontend: Page PublicRaceResults
- [ ] Frontend: Podium avec animations
- [ ] Frontend: Affichage des points gagnés
- [ ] Backend: Endpoint GET /api/sessions/public/:sessionId/results
- [ ] Backend: Calcul et attribution des points
- [ ] Backend: Mise à jour du score total de l'utilisateur
-[] Database: Table `user_stats` (user_id, total_points, rank, total_races, wins, created_at, updated_at)
- [ ] Database: Sauvegarde dans `public_session_results`

---

## EPIC 5: Classements et Leaderboards

### Feature 5.1: Classement Global

#### US-5.1.1: Voir le Classement Global
**En tant que** utilisateur (connecté ou non)  
**Je veux** voir le classement global des meilleurs joueurs  
**Afin de** me situer et m'inspirer

**Critères d'acceptation:**
- Page publique "Classement"
- Top 100 joueurs affichés
- Pour chaque joueur: rang, username, total de points, nombre de courses, WPM moyen
- Mise à jour en temps réel (WebSocket optionnel) ou toutes les 5min
- Si connecté: mise en évidence de sa propre position
- Affichage de sa position même si hors top 100: "Vous êtes 245e"
- Filtres: Global / Hebdomadaire / Mensuel
- Design dark avec couleurs or/argent/bronze pour le podium

**Tâches techniques:**
- [ ] Frontend: Page Leaderboard
- [ ] Frontend: Tableau avec top 100
- [ ] Frontend: Mise en évidence de l'utilisateur actuel
- [ ] Frontend: Filtres temporels
- [ ] Backend: Endpoint GET /api/leaderboard/global
- [ ] Backend: Query avec paramètre de période (all-time, weekly, monthly)
- [ ] Backend: Calcul du rang de l'utilisateur actuel
- [ ] Database: Index sur (total_points DESC)
- [ ] Backend: Cache Redis pour le top 100 (TTL 5min)

#### US-5.1.2: Voir le Classement Hebdomadaire
**En tant que** utilisateur  
**Je veux** voir le classement de la semaine  
**Afin de** suivre les meilleurs joueurs actuels

**Critères d'acceptation:**
- Onglet "Cette semaine" dans le leaderboard
- Réinitialisation tous les lundis 00h00
- Affichage des points gagnés cette semaine uniquement
- Les joueurs inactifs n'apparaissent pas
- Top 100 de la semaine

**Tâches techniques:**
- [ ] Backend: Table `weekly_leaderboard` (user_id, week_start_date, points, races_count)
- [ ] Backend: CRON job pour reset hebdomadaire
- [ ] Backend: Endpoint GET /api/leaderboard/weekly
- [ ] Database: Index sur (week_start_date, points DESC)

### Feature 5.2: Classement entre Amis

#### US-5.2.1: Ajouter des Amis
**En tant que** utilisateur connecté  
**Je veux** ajouter d'autres utilisateurs en amis  
**Afin de** comparer mes performances avec eux

**Critères d'acceptation:**
- Barre de recherche pour trouver des utilisateurs par username
- Bouton "Ajouter en ami" sur le profil de chaque utilisateur
- Système de demande d'ami (requête + acceptation)
- Liste de mes amis dans mon profil
- Notification quand quelqu'un m'ajoute en ami
- Possibilité de refuser ou supprimer un ami

**Tâches techniques:**
- [ ] Frontend: Barre de recherche d'utilisateurs
- [ ] Frontend: Liste d'amis
- [ ] Frontend: Notifications d'amis
- [ ] Backend: Endpoint GET /api/users/search?q=username
- [ ] Backend: Endpoint POST /api/friends/request
- [ ] Backend: Endpoint POST /api/friends/accept/:requestId
- [ ] Backend: Endpoint DELETE /api/friends/:friendId
- [ ] Database: Table `friend_requests` (id, requester_id, receiver_id, status, created_at)
- [ ] Database: Table `friendships` (id, user_id_1, user_id_2, created_at)

#### US-5.2.2: Voir le Classement de Mes Amis
**En tant que** utilisateur connecté  
**Je veux** voir un classement de mes amis uniquement  
**Afin de** me comparer à eux

**Critères d'acceptation:**
- Onglet "Amis" dans le leaderboard
- Affichage de tous mes amis classés par points
- Ma position mise en évidence
- Filtres: Global / Hebdomadaire
- Si aucun ami: message "Ajoutez des amis pour voir ce classement"

**Tâches techniques:**
- [ ] Frontend: Onglet "Amis" dans Leaderboard
- [ ] Backend: Endpoint GET /api/leaderboard/friends
- [ ] Backend: Query avec JOIN sur friendships
- [ ] Backend: Filtrage par période

---

## EPIC 6: Collection de Données pour Machine Learning

### Feature 6.1: Collecte de Données de Frappe Détaillées

#### US-6.1.1: Enregistrer Chaque Frappe Avec Contexte Complet
**En tant que** système  
**Je veux** enregistrer chaque frappe avec un maximum de métadonnées  
**Afin de** permettre une analyse ML approfondie

**Critères d'acceptation:**
- Pour chaque frappe, enregistrer:
  - `session_id`: ID de la session
  - `user_id`: ID de l'utilisateur
  - `timestamp`: Horodatage précis (millisecondes)
  - `key_pressed`: Caractère tapé
  - `expected_key`: Caractère attendu
  - `is_correct`: booléen
  - `position_in_text`: Position du caractère dans le texte (index)
  - `word_index`: Index du mot dans le texte
  - `time_since_last_key`: Temps écoulé depuis la dernière frappe (ms)
  - `is_backspace`: booléen
  - `error_type`: null | 'substitution' | 'insertion' | 'deletion'
- Les données sont d'abord bufferisées côté client (max 100 frappes ou 5s)
- Envoi batch au backend pour optimiser les performances
- Gestion de la perte de connexion: retry avec buffer local

**Tâches techniques:**
- [ ] Frontend: Système de buffer local (array)
- [ ] Frontend: Timer pour envoi automatique toutes les 5s
- [ ] Frontend: Envoi forcé à la fin de session
- [ ] Frontend: Gestion du retry en cas d'échec réseau
- [ ] Backend: Endpoint POST /api/sessions/:sessionId/keystrokes (batch)
- [ ] Backend: Validation des données avec Pydantic
- [ ] Backend: Insertion batch optimisée (PostgreSQL COPY ou bulk insert)
- [ ] Database: Table `keystrokes` avec tous les champs mentionnés
- [ ] Database: Index sur (session_id, timestamp)
- [ ] Database: Partitionnement par user_id ou date si volume important

#### US-6.1.2: Enregistrer les Métadonnées de Session
**En tant que** système  
**Je veux** enregistrer le contexte de chaque session  
**Afin de** corréler les performances avec les conditions

**Critères d'acceptation:**
- Pour chaque session, enregistrer:
  - `text_id`: ID du texte utilisé
  - `text_difficulty`: niveau de difficulté
  - `text_category`: catégorie (code, prose, etc.)
  - `device_type`: desktop / mobile / tablet
  - `keyboard_layout`: détecté si possible (QWERTY, AZERTY...)
  - `time_of_day`: heure de début de session
  - `session_duration`: durée totale (ms)
  - `completed`: booléen
  - `wpm_average`: WPM moyen calculé
  - `accuracy`: % de précision
  - `error_count`: nombre total d'erreurs
  - `backspace_count`: nombre de backspace utilisés
- Calcul automatique des métriques agrégées à la fin de session

**Tâches techniques:**
- [ ] Frontend: Détection du device type (user agent)
- [ ] Frontend: Détection du keyboard layout (si possible via JS)
- [ ] Frontend: Envoi des métadonnées au démarrage et à la fin
- [ ] Backend: Enrichissement automatique des données
- [ ] Backend: Calcul des métriques (WPM, accuracy, etc.)
- [ ] Database: Ajout des champs dans table `sessions`

### Feature 6.2: Pipeline de Données vers ML

#### US-6.2.1: Exporter les Données pour Analyse ML
**En tant que** data scientist  
**Je veux** exporter les données de frappe en format exploitable  
**Afin de** entraîner mes modèles

**Critères d'acceptation:**
- Endpoint d'export des données par utilisateur
- Format de sortie: JSON ou CSV
- Filtrage par date, session, utilisateur
- Pagination pour gros volumes
- Anonymisation possible (RGPD)
- Documentation claire du schéma de données

**Tâches techniques:**
- [ ] Backend: Endpoint GET /api/ml/export/keystrokes
- [ ] Backend: Paramètres de filtrage (user_id, start_date, end_date, session_id)
- [ ] Backend: Pagination
- [ ] Backend: Sérialisation JSON ou CSV (pandas)
- [ ] Backend: Option d'anonymisation
- [ ] Backend: Authentification renforcée (token admin ou ML service)

#### US-6.2.2: Agréger les Statistiques par Utilisateur
**En tant que** système ML  
**Je veux** accéder à des statistiques agrégées par utilisateur  
**Afin de** générer un profil de frappe

**Critères d'acceptation:**
- Endpoint retournant pour un utilisateur:
  - WPM moyen sur 7j, 30j, all-time
  - Précision moyenne sur 7j, 30j, all-time
  - Nombre total de sessions
  - Temps total de pratique (heures)
  - Distribution des erreurs par caractère (top 20)
  - Distribution des temps inter-frappes (moyenne, écart-type)
  - Taux d'utilisation de backspace
  - Courbe de progression (WPM par semaine)
- Mise en cache des statistiques (recalcul quotidien)

**Tâches techniques:**
- [ ] Backend: Endpoint GET /api/ml/users/:userId/stats
- [ ] Backend: Requêtes d'agrégation SQL optimisées
- [ ] Backend: Calcul de statistiques avancées (percentiles, écart-type)
- [ ] Backend: Cache Redis avec TTL 24h
- [ ] Backend: CRON job pour pré-calcul des stats populaires
- [ ] Database: Vues matérialisées pour les agrégations courantes

---

## EPIC 7: Analyse Machine Learning et Profil Utilisateur

### Feature 7.1: Détection des Caractères Problématiques

#### US-7.1.1: Identifier les Caractères Fréquemment Ratés
**En tant que** système ML  
**Je veux** identifier les caractères où l'utilisateur fait le plus d'erreurs  
**Afin de** créer un profil d'erreurs

**Critères d'acceptation:**
- Analyse des données de frappe de l'utilisateur
- Calcul du taux d'erreur par caractère (% d'erreurs / nb de fois tapé)
- Identification des top 10 caractères problématiques
- Prise en compte de la fréquence du caractère dans les textes
- Normalisation par difficulté intrinsèque du caractère
- Stockage du profil d'erreurs en base de données
- Mise à jour quotidienne du profil

**Tâches techniques:**
- [ ] Backend/ML: Script d'analyse des keystrokes par user
- [ ] Backend/ML: Calcul du taux d'erreur par caractère
- [ ] Backend/ML: Normalisation par fréquence du caractère en français
- [ ] Backend/ML: Pondération par difficulté (caractères spéciaux = plus durs)
- [ ] Backend/ML: Stockage dans table `user_error_profiles`
- [ ] Database: Table `user_error_profiles` (user_id, char, error_rate, frequency, last_updated)
- [ ] Backend: CRON job quotidien pour mettre à jour les profils
- [ ] Backend: Endpoint GET /api/ml/users/:userId/error-profile

#### US-7.1.2: Détecter les Bigrammes et Trigrammes Difficiles
**En tant que** système ML  
**Je veux** identifier les combinaisons de lettres qui posent problème  
**Afin de** cibler l'entraînement

**Critères d'acceptation:**
- Analyse des séquences de 2 lettres (bigrammes) et 3 lettres (trigrammes)
- Calcul du temps moyen par bigramme/trigramme
- Identification des combinaisons lentes (> moyenne + 1 écart-type)
- Stockage des bigrammes/trigrammes problématiques par utilisateur
- Mise à jour après chaque session (async)

**Tâches techniques:**
- [ ] Backend/ML: Extraction des bigrammes/trigrammes depuis keystrokes
- [ ] Backend/ML: Calcul du temps moyen par combinaison
- [ ] Backend/ML: Détection statistique des outliers (Z-score)
- [ ] Database: Table `user_difficult_sequences` (user_id, sequence, avg_time, error_rate, type)
- [ ] Backend: Job asynchrone (Celery ou asyncio) pour analyse post-session
- [ ] Backend: Endpoint GET /api/ml/users/:userId/difficult-sequences

### Feature 7.2: Classification des Types d'Erreurs

#### US-7.2.1: Classifier les Erreurs par Type
**En tant que** système ML  
**Je veux** classifier chaque erreur selon sa nature  
**Afin de** comprendre les patterns d'erreurs

**Critères d'acceptation:**
- Classification automatique de chaque erreur en:
  - **Erreur de vitesse**: frappe trop rapide, mauvaise touche adjacente
  - **Erreur cognitive**: mauvaise lettre (non adjacente), confusion mentale
  - **Erreur motrice**: mauvais doigt, coordination main
  - **Erreur de fatigue**: augmentation des erreurs sur fin de texte
- Utilisation d'heuristiques initiales:
  - Adjacent sur clavier = erreur de vitesse/motrice
  - Non adjacent = erreur cognitive
  - Augmentation du taux d'erreur dans le temps = fatigue
- Stockage de la classification dans les keystrokes (champ `error_classification`)

**Tâches techniques:**
- [ ] Backend/ML: Mapping des touches adjacentes sur clavier QWERTY/AZERTY
- [ ] Backend/ML: Algorithme de classification des erreurs
- [ ] Backend/ML: Détection de la fatigue (régression linéaire simple sur erreurs/temps)
- [ ] Database: Ajout du champ `error_classification` dans keystrokes
- [ ] Backend: Mise à jour asynchrone après chaque session
- [ ] Backend: Endpoint GET /api/ml/users/:userId/error-breakdown (répartition par type)

#### US-7.2.2: Détecter les Problèmes de Layout Clavier
**En tant que** système ML  
**Je veux** détecter si l'utilisateur a des confusions dues au layout  
**Afin de** suggérer un changement ou des exercices adaptés

**Critères d'acceptation:**
- Détection du layout utilisé (QWERTY vs AZERTY vs autre)
- Analyse des erreurs par position de touche (rangée supérieure, inférieure, etc.)
- Détection de patterns de confusion (ex: Q/A sur QWERTY/AZERTY)
- Identification des doigts faibles (index, majeur, annulaire, auriculaire)
- Scoring de "confort" avec le layout actuel

**Tâches techniques:**
- [ ] Backend/ML: Modèle de détection de layout basé sur les erreurs
- [ ] Backend/ML: Analyse par rangée de clavier
- [ ] Backend/ML: Détection des doigts faibles (mapping touche -> doigt)
- [ ] Database: Table `user_keyboard_analysis` (user_id, detected_layout, finger_strength_scores, recommendations)
- [ ] Backend: Endpoint GET /api/ml/users/:userId/keyboard-analysis

### Feature 7.3: Profil de Frappe Complet

#### US-7.3.1: Générer un Profil de Frappe Détaillé
**En tant que** utilisateur  
**Je veux** voir mon profil de frappe complet  
**Afin de** comprendre mes forces et faiblesses

**Critères d'acceptation:**
- Page "Mon Profil de Frappe" accessible depuis le menu
- Affichage visuel de:
  - **Niveau de compétence**: WPM + précision + consistance
  - **Top 10 caractères problématiques** avec taux d'erreur
  - **Top 5 bigrammes/trigrammes lents**
  - **Répartition des erreurs par type** (camembert)
  - **Analyse des doigts** (heatmap du clavier)
  - **Distribution des temps inter-frappes** (histogramme)
  - **Courbe de progression WPM** sur 30 jours
  - **Score de consistance** (0-100)
- Design dark avec visualisations interactives (tooltips)
- Bouton "Exporter mon profil" (PDF ou image)

**Tâches techniques:**
- [ ] Frontend: Page TypingProfile
- [ ] Frontend: Visualisations (Chart.js / D3.js):
  - Heatmap clavier
  - Graphique en camembert (types d'erreurs)
  - Histogramme (temps inter-frappes)
  - Graphique ligne (progression WPM)
- [ ] Frontend: Export en PDF (jsPDF ou html2canvas)
- [ ] Backend: Endpoint GET /api/ml/users/:userId/full-profile
- [ ] Backend: Agrégation de toutes les analyses ML
- [ ] Backend: Calcul du score de consistance (écart-type du WPM)

#### US-7.3.2: Calculer le Niveau de Compétence Réel
**En tant que** système ML  
**Je veux** calculer un niveau de compétence au-delà du simple WPM  
**Afin de** mieux évaluer l'utilisateur

**Critères d'acceptation:**
- Le niveau de compétence est un score 0-100 basé sur:
  - WPM moyen (30%)
  - Précision moyenne (30%)
  - Consistance (20%) = inverse de l'écart-type du WPM
  - Vitesse de progression (10%)
  - Performance sur textes difficiles (10%)
- Formule claire et documentée
- Mise à jour quotidienne du niveau
- Badge/rang associé au niveau:
  - 0-20: Débutant
  - 21-40: Novice
  - 41-60: Intermédiaire
  - 61-80: Avancé
  - 81-100: Expert

**Tâches techniques:**
- [ ] Backend/ML: Implémentation de la formule de skill level
- [ ] Backend/ML: Normalisation des WPM (z-score par rapport à la population)
- [ ] Backend/ML: Calcul de la progression (régression linéaire sur WPM/temps)
- [ ] Database: Ajout du champ `skill_level` dans user_stats
- [ ] Backend: CRON job quotidien pour mise à jour
- [ ] Frontend: Affichage du badge/rang avec animation

---

## EPIC 8: Apprentissage Personnalisé (ML)

### Feature 8.1: Recommandation de Textes Adaptés

#### US-8.1.1: Ajuster la Difficulté des Textes Dynamiquement
**En tant que** utilisateur  
**Je veux** que les textes s'adaptent à mon niveau  
**Afin de** progresser de manière optimale

**Critères d'acceptation:**
- Le système recommande automatiquement un niveau de difficulté
- La difficulté augmente progressivement si le WPM > seuil pendant 3 sessions
- La difficulté diminue si précision < 90% pendant 3 sessions
- L'utilisateur peut manuellement forcer un niveau
- Notification: "Bravo ! Vous êtes prêt pour le niveau supérieur"
- Algorithme de difficulté adaptatif basé sur:
  - WPM actuel vs WPM moyen du niveau
  - Précision récente
  - Taux de complétion des sessions

**Tâches techniques:**
- [ ] Backend/ML: Algorithme de recommandation de difficulté
- [ ] Backend/ML: Seuils par niveau (calibration sur données)
- [ ] Backend/ML: Détection des patterns de progression
- [ ] Database: Table `difficulty_recommendations` (user_id, recommended_level, reason, created_at)
- [ ] Backend: Endpoint GET /api/ml/users/:userId/recommended-difficulty
- [ ] Frontend: Notification de changement de niveau
- [ ] Frontend: Bouton "Accepter" ou "Rester au niveau actuel"

#### US-8.1.2: Sélectionner des Textes Ciblant les Faiblesses
**En tant que** système ML  
**Je veux** choisir des textes contenant les caractères/bigrammes problématiques  
**Afin de** accélérer l'apprentissage

**Critères d'acceptation:**
- Mode "Entraînement ciblé" dans Solo Practice
- Le système sélectionne des textes riches en:
  - Caractères problématiques de l'utilisateur
  - Bigrammes/trigrammes difficiles
- Affichage: "Ce texte cible vos points faibles: e, r, qu, er"
- Option de refuser et obtenir un texte aléatoire
- Tracking de l'efficacité: amélioration sur caractères ciblés mesurée

**Tâches techniques:**
- [ ] Backend/ML: Analyse de la composition des textes (TF-IDF des caractères)
- [ ] Backend/ML: Matching texte <-> profil utilisateur
- [ ] Backend/ML: Scoring de pertinence (combien de caractères faibles présents)
- [ ] Backend: Endpoint GET /api/ml/users/:userId/targeted-text
- [ ] Database: Table `text_character_composition` (text_id, char, frequency)
- [ ] Frontend: Option "Entraînement ciblé" avec explication
- [ ] Backend: Mesure de l'amélioration post-entraînement ciblé

### Feature 8.2: Exercices Personnalisés

#### US-8.2.1: Générer des Exercices de Drill Personnalisés
**En tant que** utilisateur  
**Je veux** faire des exercices courts sur mes faiblesses  
**Afin de** m'améliorer rapidement

**Critères d'acceptation:**
- Page "Exercices Personnalisés" dans le menu
- Génération de drills courts (20-30 secondes)
- Types de drills:
  - **Drill caractère**: répétition d'un caractère problématique en contexte (mots)
  - **Drill bigramme**: séquences contenant un bigramme difficile
  - **Drill vitesse**: texte facile pour pousser le WPM
  - **Drill précision**: texte difficile pour maximiser l'accuracy
- Affichage de l'objectif: "Objectif: 0 erreur sur les 'e'"
- Feedback immédiat après l'exercice
- Tracking des progrès sur chaque drill

**Tâches techniques:**
- [ ] Backend/ML: Générateur de drills basé sur templates
- [ ] Backend/ML: Sélection intelligente du type de drill
- [ ] Backend/ML: Librairie de patterns de mots (dict français)
- [ ] Backend: Endpoint GET /api/ml/users/:userId/generate-drill
- [ ] Database: Table `drills` (id, user_id, drill_type, content, target_char, created_at)
- [ ] Frontend: Page PersonalizedDrills
- [ ] Frontend: Affichage de l'objectif et du feedback
- [ ] Backend: Stockage des résultats de drills pour mesurer progrès

#### US-8.2.2: Recommander un Plan d'Entraînement
**En tant que** utilisateur  
**Je veux** recevoir un plan d'entraînement hebdomadaire  
**Afin de** progresser de façon structurée

**Critères d'acceptation:**
- Page "Mon Plan d'Entraînement"
- Plan sur 7 jours avec:
  - Jour 1: 2 drills caractères + 1 session solo moyenne
  - Jour 2: 1 drill bigramme + 1 course publique
  - Jour 3: Repos ou session libre
  - Etc.
- Le plan est adapté au profil de l'utilisateur
- Possibilité de marquer une session comme "complétée"
- Suivi de la progression hebdomadaire (% complété)
- Notification quotidienne de l'entraînement du jour (optionnel)

**Tâches techniques:**
- [ ] Backend/ML: Algorithme de génération de plan d'entraînement
- [ ] Backend/ML: Équilibrage drill / practice / competition
- [ ] Backend/ML: Adaptation basée sur disponibilité utilisateur (paramètre: 15min/jour ou 1h/jour)
- [ ] Database: Table `training_plans` (user_id, week_start, plan_json, completed_days)
- [ ] Backend: Endpoint GET /api/ml/users/:userId/training-plan
- [ ] Backend: Endpoint POST /api/ml/users/:userId/training-plan/complete-day
- [ ] Frontend: Page TrainingPlan avec checklist
- [ ] Frontend: Notifications push (optionnel)

### Feature 8.3: Détection de Fatigue et Suggestions

#### US-8.3.1: Détecter la Fatigue en Session
**En tant que** système ML  
**Je veux** détecter quand l'utilisateur est fatigué  
**Afin de** suggérer une pause

**Critères d'acceptation:**
- Analyse en temps réel pendant la session:
  - Augmentation du taux d'erreur sur les 20 derniers caractères
  - Augmentation du temps inter-frappes moyen
  - Détection de patterns de déclin (pente négative sur WPM)
- Si fatigue détectée: notification discrète pendant la session
- À la fin: suggestion "Vous semblez fatigué, prenez une pause ☕"
- Option: session de récupération (texte très facile, court)

**Tâches techniques:**
- [ ] Backend/ML: Algorithme de détection de fatigue en temps réel
- [ ] Backend/ML: Modèle de régression sur WPM/temps
- [ ] Backend/ML: Seuils de détection (tunés sur données)
- [ ] Frontend: WebSocket pour recevoir alerte de fatigue
- [ ] Frontend: Notification subtile (pas intrusive)
- [ ] Backend: Endpoint POST /api/ml/sessions/:sessionId/check-fatigue (appelé toutes les 30s)
- [ ] Backend: Suggestion de session de récupération

#### US-8.3.2: Suggérer des Sessions de Focus
**En tant que** système ML  
**Je veux** identifier quand l'utilisateur devrait faire une session de focus  
**Afin de** maximiser l'apprentissage

**Critères d'acceptation:**
- Détection de stagnation: WPM stable depuis 7 jours
- Suggestion: "Session de focus recommandée sur vos points faibles"
- La session de focus est un drill intensif sur 1-2 faiblesses majeures
- Durée courte (5min max) mais intense
- Tracking de l'impact: amélioration mesurée après la session

**Tâches techniques:**
- [ ] Backend/ML: Détection de stagnation (variance WPM < seuil)
- [ ] Backend/ML: Sélection de la faiblesse à cibler
- [ ] Backend: Endpoint GET /api/ml/users/:userId/focus-session-recommendation
- [ ] Frontend: Notification "Session de focus recommandée"
- [ ] Frontend: Page FocusSession dédiée
- [ ] Backend: Mesure pré/post session de focus

---

## EPIC 9: Prédictions et Insights ML

### Feature 9.1: Prédiction de Progression

#### US-9.1.1: Prédire le WPM Futur de l'Utilisateur
**En tant que** utilisateur  
**Je veux** voir une prédiction de mon WPM dans 30 jours  
**Afin de** me motiver

**Critères d'acceptation:**
- Affichage dans le profil: "Dans 30 jours, vous devriez atteindre ~X WPM"
- Calcul basé sur régression linéaire des WPM passés (minimum 10 sessions)
- Intervalle de confiance affiché (ex: 75 ± 5 WPM)
- Si pas assez de données: message "Complétez 10 sessions pour voir votre prédiction"
- Mise à jour quotidienne de la prédiction

**Tâches techniques:**
- [ ] Backend/ML: Modèle de régression linéaire sur WPM/temps
- [ ] Backend/ML: Calcul de l'intervalle de confiance
- [ ] Backend/ML: Minimum 10 sessions pour prédiction fiable
- [ ] Database: Table `wpm_predictions` (user_id, predicted_wpm, confidence_interval, prediction_date)
- [ ] Backend: CRON job quotidien pour mise à jour
- [ ] Backend: Endpoint GET /api/ml/users/:userId/wpm-prediction
- [ ] Frontend: Affichage de la prédiction avec graphique (tendance)

#### US-9.1.2: Détecter les Plateaux de Performance
**En tant que** système ML  
**Je veux** détecter quand un utilisateur stagne  
**Afin de** suggérer des actions

**Critères d'acceptation:**
- Détection automatique de plateau:
  - WPM varie de moins de 3% sur 14 jours
  - Minimum 20 sessions dans la période
- Notification: "Vous stagnez depuis 2 semaines. Voici comment progresser:"
- Suggestions concrètes:
  - "Augmentez la difficulté"
  - "Travaillez ces caractères spécifiquement"
  - "Essayez des textes de code/technique"
- Tracking: l'utilisateur a-t-il surmonté le plateau ?

**Tâches techniques:**
- [ ] Backend/ML: Algorithme de détection de plateau
- [ ] Backend/ML: Calcul de la variance sur fenêtre glissante
- [ ] Backend/ML: Génération de suggestions basées sur le profil
- [ ] Database: Table `plateaus` (user_id, start_date, end_date, wpm_at_plateau, resolved)
- [] Backend: CRON job hebdomadaire pour détection
- [ ] Backend: Endpoint GET /api/ml/users/:userId/plateau-status
- [ ] Frontend: Notification de plateau avec suggestions
- [ ] Frontend: Modal détaillé avec plan d'action

### Feature 9.2: Insights Actionnables

#### US-9.2.1: Générer des Insights Quotidiens
**En tant que** utilisateur  
**Je veux** recevoir un insight quotidien sur ma frappe  
**Afin de** savoir sur quoi me concentrer

**Critères d'acceptation:**
- Chaque jour, affichage d'un insight sur la page d'accueil
- Exemples d'insights:
  - "Votre vitesse sur 'qu' a augmenté de 15% cette semaine 🎉"
  - "Concentrez-vous sur la lettre 'e' aujourd'hui, c'est votre principale faiblesse"
  - "Vous êtes 12% plus rapide le matin, pratiquez à ce moment"
  - "Votre précision a baissé de 5% cette semaine, ralentissez légèrement"
- Insights basés sur analyse des données récentes (7 derniers jours)
- Ton positif et encourageant
- Actionnable: toujours une suggestion concrète

**Tâches techniques:**
- [ ] Backend/ML: Générateur d'insights avec templates
- [ ] Backend/ML: Analyse des variations sur 7j
- [ ] Backend/ML: Détection des patterns (heure, jour, etc.)
- [ ] Backend/ML: Priorisation des insights (impact potentiel)
- [ ] Database: Table `daily_insights` (user_id, insight_text, insight_type, date, dismissed)
- [ ] Backend: CRON job quotidien pour génération
- [ ] Backend: Endpoint GET /api/ml/users/:userId/daily-insight
- [ ] Frontend: Card "Insight du jour" sur dashboard
- [ ] Frontend: Possibilité de "Masquer" l'insight

#### US-9.2.2: Fournir des Explications sur les Performances
**En tant que** utilisateur  
**Je veux** comprendre pourquoi ma performance a varié  
**Afin de** identifier les causes

**Critères d'acceptation:**
- Après chaque session, affichage optionnel: "Comprendre ma performance"
- Analyse explicative:
  - "Vous êtes 8% plus lent que votre moyenne, probablement dû à la fatigue (session en fin de journée)"
  - "Votre précision est excellente (98%), vous maîtrisez ce niveau"
  - "Le texte contenait 40% de vos caractères faibles, c'est normal d'être plus lent"
- Comparaison avec sessions similaires (même difficulté, même heure)
- Conseils: "Pour améliorer, essayez..."

**Tâches techniques:**
- [ ] Backend/ML: Modèle d'explication basé sur features:
  - Heure de la session
  - Difficulté du texte
  - Composition du texte (caractères faibles présents)
  - Fatigue cumulée (sessions déjà faites dans la journée)
- [ ] Backend/ML: Comparaison avec baseline personnelle
- [ ] Backend: Endpoint POST /api/ml/sessions/:sessionId/explain
- [ ] Frontend: Bouton "Comprendre ma performance" sur résultats
- [ ] Frontend: Modal avec explications détaillées

---

## EPIC 10: Anti-Triche et Sécurité

### Feature 10.1: Détection d'Anomalies

#### US-10.1.1: Détecter les WPM Impossibles
**En tant que** système  
**Je veux** détecter les WPM suspects  
**Afin de** préserver l'intégrité des compétitions

**Critères d'acceptation:**
- Détection automatique de WPM > 200 (humainement suspect)
- Détection de progressions impossibles (ex: +100 WPM en 1 jour)
- Analyse du pattern de frappe (régularité trop parfaite = bot)
- Détection de copier-coller (temps inter-frappes = 0)
- Flagging automatique de la session comme "suspecte"
- L'utilisateur peut contester le flag
- Admin review des sessions flaggées

**Tâches techniques:**
- [ ] Backend/ML: Algorithme de détection d'anomalies:
  - Z-score sur WPM (> 3 écarts-types = suspect)
  - Détection de régularité anormale (écart-type des temps inter-frappes trop faible)
  - Détection de copier-coller (séquences avec time = 0)
- [ ] Backend: Flagging automatique post-session
- [ ] Database: Champ `is_suspicious` et `suspicious_reason` dans sessions
- [ ] Database: Table `admin_reviews` (session_id, reviewer_id, decision, reviewed_at)
- [ ] Backend: Endpoint GET /api/admin/suspicious-sessions
- [ ] Frontend Admin: Interface de review
- [ ] Backend: Notification à l'utilisateur si session invalidée

#### US-10.1.2: Bannir les Tricheurs Récidivistes
**En tant qu'** admin  
**Je veux** bannir les utilisateurs qui trichent de manière répétée  
**Afin de** maintenir un environnement fair-play

**Critères d'acceptation:**
- Système de strikes: 3 sessions suspectes confirmées = ban
- L'utilisateur est notifié de chaque strike
- Possibilité de contester un strike (ticket support)
- Ban automatique après 3 strikes
- Bannissement empêche connexion et participation
- Les données de l'utilisateur banni sont conservées (analyse ML)

**Tâches techniques:**
- [ ] Database: Table `user_strikes` (user_id, session_id, strike_reason, given_at, contested)
- [ ] Database: Champ `is_banned` et `ban_reason` dans users
- [ ] Backend: Logique d'attribution de strike
- [ ] Backend: Auto-ban après 3 strikes
- [ ] Backend: Middleware de vérification du ban sur toutes les routes
- [ ] Frontend: Message de ban à la connexion
- [ ] Backend: Système de contestation (tickets)

### Feature 10.2: Protection contre les Bots

#### US-10.2.1: Implémenter un CAPTCHA à l'Inscription
**En tant que** système  
**Je veux** empêcher les bots de créer des comptes  
**Afin de** protéger l'application

**Critères d'acceptation:**
- CAPTCHA sur la page d'inscription (Google reCAPTCHA v3 ou hCaptcha)
- Validation côté serveur du token CAPTCHA
- Échec du CAPTCHA = inscription refusée
- Design intégré au dark mode

**Tâches techniques:**
- [ ] Frontend: Intégration de reCAPTCHA v3 ou hCaptcha
- [ ] Frontend: Envoi du token CAPTCHA avec formulaire
- [ ] Backend: Validation du token via API Google/hCaptcha
- [ ] Backend: Refus de l'inscription si validation échoue
- [ ] Backend: Logging des tentatives suspectes

#### US-10.2.2: Rate Limiting sur les Endpoints Critiques
**En tant que** système  
**Je veux** limiter le nombre de requêtes par IP  
**Afin d'** empêcher les abus

**Critères d'acceptation:**
- Rate limiting sur:
  - Login: 5 tentatives / 15 minutes / IP
  - Inscription: 3 comptes / heure / IP
  - Démarrage de session: 20 / heure / utilisateur
- Réponse 429 (Too Many Requests) si limite dépassée
- Affichage du temps d'attente: "Réessayez dans 10 minutes"

**Tâches techniques:**
- [ ] Backend: Middleware de rate limiting (Redis + sliding window)
- [ ] Backend: Configuration des limites par endpoint
- [ ] Backend: Réponse 429 avec Retry-After header
- [ ] Frontend: Gestion de l'erreur 429 avec message clair
- [ ] Backend: Logging des violations de rate limit

---

## EPIC 11: Communication Temps Réel

### Feature 11.1: WebSocket pour les Courses

#### US-11.1.1: Synchroniser les Participants en Temps Réel
**En tant que** développeur  
**Je veux** utiliser WebSocket pour synchroniser les courses  
**Afin de** garantir une latence minimale

**Critères d'acceptation:**
- Connexion WebSocket établie dès l'entrée dans une session
- Événements temps réel:
  - `player_joined`: nouveau joueur dans le lobby
  - `player_ready`: joueur prêt à commencer
  - `race_starting`: countdown de démarrage
  - `race_started`: début de la course
  - `player_progress`: progression d'un joueur (throttled à 500ms)
  - `player_finished`: joueur a terminé
  - `race_ended`: course terminée, résultats disponibles
- Reconnexion automatique en cas de perte de connexion
- Gestion du lag: affichage d'un indicateur de latence

**Tâches techniques:**
- [ ] Backend: Setup WebSocket server (FastAPI WebSocket ou Socket.IO)
- [ ] Backend: Rooms par session (isolation des événements)
- [ ] Backend: Broadcasting des événements aux participants d'une room
- [ ] Backend: Throttling des updates de progression (max 2/seconde)
- [ ] Frontend: Connexion WebSocket avec reconnexion automatique
- [ ] Frontend: Listeners pour chaque type d'événement
- [ ] Frontend: Indicateur de latence (ping/pong)
- [ ] Frontend: Gestion de la déconnexion (affichage "Reconnexion...")

#### US-11.1.2: Optimiser la Bande Passante
**En tant que** système  
**Je veux** minimiser les données échangées via WebSocket  
**Afin de** supporter un grand nombre de joueurs

**Critères d'acceptation:**
- Messages WebSocket compressés (JSON minimal ou MessagePack)
- Envoi uniquement des deltas (changements, pas état complet)
- Throttling côté client: max 2 messages/seconde pour progression
- Batching des événements non critiques
- Taille moyenne d'un message < 200 bytes

**Tâches techniques:**
- [ ] Backend: Compression des messages (gzip ou MessagePack)
- [ ] Backend: Envoi de deltas uniquement
- [ ] Frontend: Throttling des envois (lodash.throttle ou custom)
- [ ] Frontend: Batching des keystrokes avant envoi
- [ ] Backend: Monitoring de la taille des messages (métriques)

### Feature 11.2: Notifications en Temps Réel

#### US-11.2.1: Notifier les Événements Importants
**En tant que** utilisateur  
**Je veux** recevoir des notifications en temps réel  
**Afin de** rester informé des événements

**Critères d'acceptation:**
- Notifications in-app (toast) pour:
  - Demande d'ami reçue
  - Défi d'un ami
  - Course publique trouvée
  - Achievement débloqué
  - Insight quotidien disponible
- Notifications non intrusives (coin supérieur droit)
- Son optionnel (activable dans settings)
- Historique des notifications accessible

**Tâches techniques:**
- [ ] Frontend: Système de notifications toast (library: react-toastify ou custom)
- [ ] Frontend: Gestion des permissions de notification browser
- [ ] Frontend: Sons de notification (assets audio)
- [ ] Backend: WebSocket pour push des notifications
- [ ] Backend: Stockage des notifications non lues
- [ ] Database: Table `notifications` (user_id, type, content, read, created_at)
- [ ] Frontend: Badge de notifications non lues

---

## EPIC 12: Observabilité et Monitoring

### Feature 12.1: Logging Structuré

#### US-12.1.1: Logger Tous les Événements Critiques
**En tant que** développeur  
**Je veux** des logs structurés et interrogeables  
**Afin de** déboguer et analyser le système

**Critères d'acceptation:**
- Logs au format JSON structuré
- Niveaux de log: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Champs standards dans chaque log:
  - `timestamp`: horodatage ISO 8601
  - `level`: niveau du log
  - `service`: backend, frontend, ml
  - `user_id`: si applicable
  - `session_id`: si applicable
  - `message`: message du log
  - `extra`: données additionnelles
- Logs centralisés (aggregation)
- Rotation des logs (max 30 jours)

**Tâches techniques:**
- [ ] Backend: Configuration de logging (Python logging + structlog)
- [ ] Backend: Middleware pour logger toutes les requêtes HTTP
- [ ] Backend: Logger les exceptions avec stack trace
- [ ] Backend: Ajout du user_id et session_id dans le contexte
- [ ] Infrastructure: Setup d'un système de log aggregation (ELK, Loki, ou CloudWatch)
- [ ] Backend: Rotation automatique des fichiers de log

#### US-12.1.2: Tracer les Décisions ML
**En tant que** data scientist  
**Je veux** tracer chaque décision ML  
**Afin de** comprendre et améliorer les modèles

**Critères d'acceptation:**
- Chaque prédiction/recommandation ML est loggée:
  - Type de décision (difficulté, drill, insight...)
  - Input features utilisées
  - Output (prédiction)
  - Modèle/version utilisé
  - Timestamp
- Stockage dans une table dédiée pour analyse
- Possibilité de rejouer une décision (debugging)

**Tâches techniques:**
- [ ] Backend/ML: Logging systématique des décisions ML
- [ ] Database: Table `ml_decisions` (decision_type, user_id, input_features, output, model_version, timestamp)
- [ ] Backend/ML: Fonction helper pour logger facilement
- [ ] Backend: Endpoint GET /api/ml/decisions/:userId (pour debug)

### Feature 12.2: Métriques et Alertes

#### US-12.2.1: Collecter des Métriques Système
**En tant qu'** ops  
**Je veux** monitorer les métriques système  
**Afin de** détecter les problèmes

**Critères d'acceptation:**
- Métriques collectées:
  - Latence des endpoints (p50, p95, p99)
  - Taux d'erreur HTTP (4xx, 5xx)
  - Nombre de requêtes par minute
  - Utilisation CPU/mémoire
  - Connexions WebSocket actives
  - Queue size (matchmaking)
  - Taille de la base de données
- Dashboard de monitoring (Grafana ou similaire)
- Alertes si:
  - Latence p95 > 500ms
  - Taux d'erreur > 5%
  - CPU > 80% pendant 5min
  - Queue matchmaking > 50 joueurs

**Tâches techniques:**
- [ ] Backend: Instrumentation avec Prometheus ou StatsD
- [ ] Backend: Middleware pour mesurer latence des endpoints
- [ ] Backend: Export des métriques sur endpoint /metrics
- [ ] Infrastructure: Setup Prometheus + Grafana (ou équivalent cloud)
- [ ] Infrastructure: Configuration des dashboards
- [ ] Infrastructure: Setup des alertes (AlertManager ou cloud alerting)

#### US-12.2.2: Monitorer la Santé des Modèles ML
**En tant que** ML engineer  
**Je veux** monitorer la performance des modèles ML  
**Afin de** détecter la dégradation

**Critères d'acceptation:**
- Métriques ML:
  - Précision des prédictions de WPM (erreur moyenne)
  - Taux d'acceptance des recommandations de difficulté
  - Taux de complétion des drills personnalisés
  - Distribution des prédictions (drift detection)
- Dashboard ML dédié
- Alertes si:
  - Erreur de prédiction WPM > 15%
  - Taux d'acceptance des recommandations < 50%
  - Distribution drift détecté (KL divergence > seuil)

**Tâches techniques:**
- [ ] Backend/ML: Calcul des métriques de performance des modèles
- [ ] Backend/ML: Comparaison prédiction vs réalité (post-session)
- [ ] Backend/ML: Stockage des métriques ML dans time-series DB
- [ ] Backend/ML: Détection de drift (comparaison distributions)
- [ ] Infrastructure: Dashboard ML (Grafana ou MLflow)
- [ ] Backend/ML: Alertes sur dégradation modèle

---

## EPIC 13: Tests et Qualité

### Feature 13.1: Tests Unitaires et d'Intégration

#### US-13.1.1: Couvrir le Backend avec des Tests
**En tant que** développeur  
**Je veux** des tests automatisés sur le backend  
**Afin de** garantir la fiabilité

**Critères d'acceptation:**
- Couverture de code > 80%
- Tests unitaires pour:
  - Logique métier (calcul WPM, accuracy, etc.)
  - Algorithmes ML (classification erreurs, recommandations)
  - Validation des données (Pydantic models)
- Tests d'intégration pour:
  - Endpoints API (toutes les routes)
  - WebSocket (connexion, envoi, réception)
  - Base de données (queries, transactions)
- Tests exécutés en CI/CD automatiquement
- Rapport de couverture généré

**Tâches techniques:**
- [ ] Backend: Setup pytest
- [ ] Backend: Fixtures pour DB de test (PostgreSQL test)
- [ ] Backend: Tests unitaires pour chaque module métier
- [ ] Backend: Tests d'intégration API (TestClient FastAPI)
- [ ] Backend: Tests WebSocket
- [ ] Backend: Mock des services externes (email, ML)
- [ ] CI/CD: Exécution des tests à chaque commit
- [ ] CI/CD: Génération du rapport de couverture (pytest-cov)

#### US-13.1.2: Tester le Frontend
**En tant que** développeur  
**Je veux** tester les composants React  
**Afin de** éviter les régressions

**Critères d'acceptation:**
- Tests unitaires pour:
  - Composants critiques (TypingArea, SessionResults, etc.)
  - Hooks personnalisés
  - Fonctions utilitaires (calcul WPM, formatage)
- Tests d'intégration pour:
  - Flux d'authentification
  - Démarrage et complétion de session
  - Affichage des résultats
- Tests E2E pour les user journeys critiques (optionnel)
- Couverture > 70%

**Tâches techniques:**
- [ ] Frontend: Setup Vitest + React Testing Library
- [ ] Frontend: Tests des composants avec render et assertions
- [ ] Frontend: Tests des hooks (renderHook)
- [ ] Frontend: Mock des API calls (MSW)
- [ ] Frontend: Tests E2E avec Playwright ou Cypress (optionnel)
- [ ] CI/CD: Exécution des tests frontend

### Feature 13.2: Tests de Performance

#### US-13.2.1: Tester la Charge du Système
**En tant qu'** ops  
**Je veux** tester la capacité de charge  
**Afin de** dimensionner l'infrastructure

**Critères d'acceptation:**
- Tests de charge simulant:
  - 100 utilisateurs simultanés en course
  - 1000 requêtes/minute sur API
  - 50 connexions WebSocket simultanées
- Mesures:
  - Latence moyenne et p95
  - Taux d'erreur
  - Utilisation des ressources (CPU, RAM, DB)
- Identification des goulots d'étranglement
- Rapport de performance généré

**Tâches techniques:**
- [ ] Infrastructure: Setup outil de load testing (Locust, k6, ou JMeter)
- [ ] Infrastructure: Scénarios de test (création compte, course, etc.)
- [ ] Infrastructure: Exécution des tests sur environnement de staging
- [ ] Infrastructure: Analyse des résultats
- [ ] Infrastructure: Optimisation basée sur les bottlenecks

---

## EPIC 14: Infrastructure et Déploiement

### Feature 14.1: Configuration Docker

#### US-14.1.1: Dockeriser l'Application
**En tant que** développeur  
**Je veux** des containers Docker pour chaque service  
**Afin de** faciliter le déploiement

**Critères d'acceptation:**
- Dockerfile pour le backend (Python FastAPI)
- Dockerfile pour le frontend (Node + Vite build)
- docker-compose.yml pour orchestration locale:
  - Backend
  - Frontend
  - PostgreSQL
  - Redis (pour cache et sessions)
- Volumes pour persistance des données
- Network isolé
- Hot-reload en dev

**Tâches techniques:**
- [ ] Backend: Dockerfile multi-stage (build + prod)
- [ ] Frontend: Dockerfile (build static + serve avec nginx)
- [ ] Infrastructure: docker-compose.yml
- [ ] Infrastructure: Configuration des variables d'environnement
- [ ] Infrastructure: Scripts de démarrage (make up, make down)
- [ ] Infrastructure: Documentation du setup Docker

### Feature 14.2: CI/CD Pipeline

#### US-14.2.1: Automatiser les Déploiements
**En tant que** développeur  
**Je veux** un pipeline CI/CD  
**Afin d'** automatiser tests et déploiement

**Critères d'acceptation:**
- Pipeline GitHub Actions (ou GitLab CI) avec steps:
  - Linting (backend: black, pylint / frontend: eslint)
  - Tests unitaires
  - Tests d'intégration
  - Build des images Docker
  - Push vers registry (Docker Hub ou AWS ECR)
  - Déploiement automatique sur staging (merge sur develop)
  - Déploiement manuel sur prod (merge sur main)
- Notifications sur Slack/Discord en cas d'échec
- Rollback automatique en cas d'erreur

**Tâches techniques:**
- [ ] Infrastructure: Configuration GitHub Actions ou GitLab CI
- [ ] Infrastructure: Jobs de linting
- [ ] Infrastructure: Jobs de test (backend + frontend)
- [ ] Infrastructure: Job de build Docker
- [ ] Infrastructure: Job de push vers registry
- [ ] Infrastructure: Job de déploiement (staging et prod)
- [ ] Infrastructure: Intégration avec notification service
- [ ] Infrastructure: Script de rollback

### Feature 14.3: Déploiement Production

#### US-14.3.1: Déployer sur le Cloud
**En tant qu'** ops  
**Je veux** déployer l'application sur le cloud  
**Afin qu'** elle soit accessible publiquement

**Critères d'acceptation:**
- Infrastructure as Code (Terraform ou CloudFormation)
- Services déployés:
  - Frontend sur CDN (CloudFront, Netlify, ou Vercel)
  - Backend sur instances (EC2, ECS, ou Kubernetes)
  - PostgreSQL sur service managé (RDS, Cloud SQL)
  - Redis sur service managé (ElastiCache, MemoryStore)
- Auto-scaling configuré (min 2, max 10 instances backend)
- Load balancer pour distribution du trafic
- SSL/TLS configuré (HTTPS)
- Backup automatique de la DB (quotidien)

**Tâches techniques:**
- [ ] Infrastructure: Choix du cloud provider (AWS, GCP, Azure)
- [ ] Infrastructure: Configuration Terraform/CloudFormation
- [ ] Infrastructure: Setup VPC, subnets, security groups
- [ ] Infrastructure: Déploiement PostgreSQL managé
- [ ] Infrastructure: Déploiement Redis managé
- [ ] Infrastructure: Déploiement backend (ECS, Kubernetes, ou EC2)
- [ ] Infrastructure: Déploiement frontend (S3 + CloudFront ou équivalent)
- [ ] Infrastructure: Configuration load balancer
- [ ] Infrastructure: Configuration SSL (Let's Encrypt ou ACM)
- [ ] Infrastructure: Setup auto-scaling
- [ ] Infrastructure: Configuration backups DB

---

## EPIC 15: Features Additionnelles

### Feature 15.1: Thèmes et Customisation

#### US-15.1.1: Personnaliser l'Interface (Dark Mode Only)
**En tant que** utilisateur  
**Je veux** personnaliser les couleurs du dark mode  
**Afin de** adapter l'interface à mes préférences

**Critères d'acceptation:**
- Dark mode par défaut (non désactivable)
- Choix de schémas de couleurs dark:
  - Midnight Blue (bleu foncé)
  - Deep Purple (violet foncé)
  - Carbon Black (noir pur)
  - Forest Green (vert foncé)
- Personnalisation des couleurs d'accent (vert, bleu, rouge, or)
- Preview en temps réel
- Sauvegarde de la préférence par utilisateur

**Tâches techniques:**
- [ ] Frontend: Variables CSS pour les couleurs
- [ ] Frontend: Composant ThemeSelector
- [ ] Frontend: Application dynamique du thème (context + localStorage)
- [ ] Frontend: Preview en temps réel
- [ ] Backend: Stockage de la préférence utilisateur
- [ ] Database: Champ `theme_preference` dans users

### Feature 15.2: Achievements et Badges

#### US-15.2.1: Débloquer des Achievements
**En tant que** utilisateur  
**Je veux** débloquer des achievements  
**Afin de** me sentir récompensé

**Critères d'acceptation:**
- Liste d'achievements:
  - "Première course" (terminer 1 session)
  - "Speed Demon" (atteindre 100 WPM)
  - "Perfectionniste" (99%+ accuracy sur 10 sessions)
  - "Marathon" (compléter 100 sessions)
  - "Vainqueur" (gagner 10 courses publiques)
  - "Apprenti" (compléter 5 drills personnalisés)
  - "Social" (ajouter 5 amis)
  - ... (25+ achievements au total)
- Notification in-app lors du déblocage
- Page "Achievements" avec progress bars
- Affichage de badges sur le profil

**Tâches techniques:**
- [ ] Backend: Définition des achievements (config JSON)
- [ ] Backend: Vérification automatique après chaque session
- [ ] Backend: Attribution de l'achievement
- [ ] Database: Table `achievements` (id, name, description, icon, requirement)
- [ ] Database: Table `user_achievements` (user_id, achievement_id, unlocked_at)
- [ ] Backend: Endpoint GET /api/achievements/user/:userId
- [ ] Frontend: Page Achievements
- [ ] Frontend: Notification de déblocage
- [ ] Frontend: Badges sur le profil

### Feature 15.3: Mode Entraînement Spécialisé

#### US-15.3.1: Mode Code (Programmation)
**En tant que** développeur  
**Je veux** m'entraîner sur du code  
**Afin d'** améliorer ma frappe pour la programmation

**Critères d'acceptation:**
- Sélection de langage: Python, JavaScript, Java, C++, etc.
- Textes contenant du vrai code (fonctions, classes, etc.)
- Statistiques spécifiques au code:
  - WPM sur symboles (`{`, `}`, `(`, `)`, etc.)
  - Erreurs sur indentation
  - Précision sur camelCase, snake_case
- Leaderboard séparé pour le mode code

**Tâches techniques:**
- [ ] Database: Textes de code par langage
- [ ] Backend: Filtrage des textes par catégorie "code"
- [ ] Backend: Calcul de métriques spécifiques (symboles, etc.)
- [ ] Frontend: Option "Mode Code" dans Solo Practice
- [ ] Frontend: Sélecteur de langage
- [ ] Frontend: Affichage de stats code-specific

---

## EPIC 16: Documentation et Onboarding

### Feature 16.1: Documentation Utilisateur

#### US-16.1.1: Tutoriel Interactif pour Nouveaux Utilisateurs
**En tant que** nouvel utilisateur  
**Je veux** un tutoriel guidé  
**Afin de** comprendre comment utiliser l'application

**Critères d'acceptation:**
- Tutoriel au premier login (skippable)
- Steps:
  - "Bienvenue sur Hakinga !"
  - "Faites votre première session solo"
  - "Consultez vos résultats"
  - "Découvrez votre profil de frappe"
  - "Lancez-vous dans une course publique"
- Tooltips interactifs
- Possibilité de relancer le tutoriel depuis les settings

**Tâches techniques:**
- [ ] Frontend: Librairie de tutoriel (Intro.js, react-joyride)
- [ ] Frontend: Définition des steps
- [ ] Frontend: Overlay et tooltips
- [ ] Frontend: Skip et navigation
- [ ] Backend: Flag `tutorial_completed` dans users

### Feature 16.2: Documentation Technique

#### US-16.2.1: Documenter l'API
**En tant que** développeur externe  
**Je veux** une documentation API claire  
**Afin d'** intégrer avec Hakinga

**Critères d'acceptation:**
- Documentation auto-générée (OpenAPI/Swagger)
- Accessible sur `/docs`
- Pour chaque endpoint:
  - Description
  - Paramètres
  - Exemple de requête
  - Exemple de réponse
  - Codes d'erreur possibles
- Section d'authentification JWT

**Tâches techniques:**
- [ ] Backend: FastAPI génère automatiquement OpenAPI
- [ ] Backend: Annotations complètes des endpoints (docstrings, response_model)
- [ ] Backend: Exemples dans les schémas Pydantic
- [ ] Backend: Endpoint /docs activé
- [ ] Backend: Customisation de la doc (titre, description)

---

## Backlog Priorisé (Ordre de Développement Recommandé)

### Phase 1: MVP (Minimum Viable Product) 

**Objectif:** Application fonctionnelle avec mode solo et compétition basique

1. **EPIC 1: Authentication & User Management**
   - Features 1.1 (Authentification JWT) et 1.2 (Profil utilisateur)
2. **EPIC 2: Mode Solo Practice**
   - Features 2.1 (Session solo) et 2.2 (Historique)
3. **EPIC 4: Mode Compétition Publique** (version simplifiée)
   - Feature 4.1 (Matchmaking basique) et 4.2 (Course publique)
4. **EPIC 5: Classements** (version basique)
   - Feature 5.1 (Classement global uniquement)
5. **EPIC 11: Communication Temps Réel** (pour les courses)
   - Feature 11.1 (WebSocket)


Voici la **suite logique et complète du backlog**, dans le même format, en gardant un **niveau produit + technique**, cohérent avec FastAPI / React / ML.

---

### Phase 2: Fonctionnalités Sociales & Expérience Multijoueur

**Objectif :** Interaction entre utilisateurs et sessions privées

6. **EPIC 3: Sessions Privées entre Amis**

   * Feature 3.1 : Création de session privée
   * Feature 3.2 : Invitation par lien sécurisé (token + expiration)
   * Feature 3.3 : Gestion des participants (rejoindre / quitter)
   * Feature 3.4 : Lancement synchronisé de la course

7. **EPIC 6: Profil & Statistiques Avancées**

   * Feature 6.1 : Statistiques utilisateur détaillées (WPM, précision, erreurs fréquentes)
   * Feature 6.2 : Historique des courses (solo / public / privé)
   * Feature 6.3 : Progression dans le temps (courbes)

8. **EPIC 7: Textes & Contenus**

   * Feature 7.1 : Banque de textes (niveaux : facile, moyen, difficile)
   * Feature 7.2 : Textes dynamiques (longueur variable)
   * Feature 7.3 : Catégorisation (code, prose, citations, langues)

---

### Phase 3: Intelligence Artificielle & Personnalisation – 4–6 semaines

**Objectif :** Différenciation produit via ML

9. **EPIC 8: Analyse des Erreurs (ML)**

   * Feature 8.1 : Collecte fine des frappes (key events, timings)
   * Feature 8.2 : Détection des erreurs récurrentes (lettres, digrammes)
   * Feature 8.3 : Analyse du rythme de frappe (latence, pauses)
   * Feature 8.4 : Score de difficulté personnalisé

10. **EPIC 9: Personnalisation de l’Apprentissage (ML)**

* Feature 9.1 : Profil de frappe utilisateur (typing fingerprint)
* Feature 9.2 : Recommandation automatique d’exercices
* Feature 9.3 : Ajustement dynamique de la difficulté
* Feature 9.4 : Objectifs personnalisés (précision vs vitesse)

11. **EPIC 10: Génération Adaptative d’Exercices**

* Feature 10.1 : Génération de textes ciblant les faiblesses
* Feature 10.2 : Répétition intelligente (spaced repetition)
* Feature 10.3 : Mode entraînement “focus erreurs”

---

### Phase 4: Classements Avancés & Gamification – 2–3 semaines

**Objectif :** Engagement et rétention

12. **EPIC 12: Classements Avancés**

* Feature 12.1 : Classements par période (jour / semaine / mois)
* Feature 12.2 : Classements par mode (solo, public)
* Feature 12.3 : Classements entre amis

13. **EPIC 13: Gamification**

* Feature 13.1 : Badges & achievements
* Feature 13.2 : Niveaux utilisateur
* Feature 13.3 : Défis quotidiens / hebdomadaires

---

### Phase 5: Qualité, Sécurité & Scalabilité – 2–3 semaines

**Objectif :** Production-ready

14. **EPIC 14: Sécurité & Auth**

* Feature 14.1 : JWT access + refresh tokens
* Feature 14.2 : Rate limiting (login, WebSocket)
* Feature 14.3 : Protection anti-abus (spam sessions)

15. **EPIC 15: Performance & Scalabilité**

* Feature 15.1 : Optimisation WebSocket (rooms, events)
* Feature 15.2 : Caching Redis (leaderboards, profils)
* Feature 15.3 : Pagination & indexes PostgreSQL

16. **EPIC 16: Observabilité & Qualité**

* Feature 16.1 : Logging structuré
* Feature 16.2 : Monitoring (latence, erreurs)
* Feature 16.3 : Tests (unitaires, intégration, charge)

---

### Phase 6: Extensions Futures (Post-MVP)

17. **EPIC 17: Multilingue**

* Feature 17.1 : Support multi-langues
* Feature 17.2 : Profils de frappe par langue

18. **EPIC 18: IA Avancée**

* Feature 18.1 : Détection de fatigue
* Feature 18.2 : Prédiction de progression
* Feature 18.3 : Coaching IA (feedback textuel)

