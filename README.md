# MarketMate AI — Netlify + Supabase

Version indépendante de l'hébergement ChatGPT, préparée pour le pilote Snug & Mum. Application Next.js, authentification Supabase, base PostgreSQL Supabase et médias Supabase Storage privés.

Le code est prêt à configurer. Le déploiement Netlify, le projet Supabase et les connexions Shopify/IA/Meta doivent encore être activés avec les comptes du propriétaire. Le site MarketMate précédent n'est pas modifié par cette migration.

## Installation sur vos comptes

1. Créer ou choisir un projet Supabase dédié. Dans son SQL Editor, exécuter une fois `supabase/migrations/20261020140000_marketmate_init.sql`. Le script crée le schéma isolé `marketmate`, les tables, les restrictions RLS et le bucket privé `marketmate-media`. Ne pas exposer ce schéma dans les réglages Data API.
2. Dans Netlify, importer ce dépôt GitHub. Le fichier `netlify.toml` configure Next.js, Node 22, `npm run build` et le dossier `.next`.
3. Dans les variables d'environnement Netlify, saisir les valeurs listées dans `.env.example`. Les clés publiques Supabase sont nécessaires à la compilation : redéployer après leur modification. Les secrets restent exclusivement côté serveur.
4. Dans Supabase Authentication → URL Configuration, définir la Site URL sur votre origine Netlify et autoriser `https://VOTRE-SITE.netlify.app/auth/callback` comme Redirect URL. Ajouter les mêmes URLs pour votre domaine personnalisé si utilisé.
5. Conserver la confirmation des e-mails et configurer un SMTP adapté avant une ouverture aux utilisateurs. Le SMTP fourni par défaut ne doit pas être considéré comme une solution d'envoi de production.
6. Déployer sur Netlify, ouvrir le site et créer le compte avec l'adresse renseignée dans `PILOT_OWNER_EMAIL`. Confirmer l'e-mail puis se connecter. La connexion Supabase de votre application est distincte de votre connexion personnelle au tableau de bord Supabase.

Une page `/setup` indique les réglages de base manquants sans afficher de secret. La présence d'une variable n'atteste pas que sa valeur est valide.

## Variables de base

- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` : URL et clé publique du projet, utilisables dans le navigateur.
- `DATABASE_URL` : chaîne du **transaction pooler Supabase**, typiquement port 6543, avec mot de passe encodé pour une URL. Connexion PostgreSQL privilégiée, **serveur uniquement**. Les requêtes de l'application imposent l'identité vérifiée et le propriétaire ; le compte PostgreSQL serveur peut contourner RLS et ne doit jamais être exposé au navigateur.
- `SUPABASE_SECRET_KEY` : clé serveur pour les fichiers privés. Une ancienne `SUPABASE_SERVICE_ROLE_KEY` est aussi acceptée en remplacement. Jamais de préfixe `NEXT_PUBLIC_` pour ces clés.
- `APP_BASE_URL` : origine finale, par exemple `https://votre-site.netlify.app`, sans slash final. Les écritures sont limitées à cette origine, pas aux prévisualisations Netlify.
- `PILOT_OWNER_EMAIL` : compte autorisé à utiliser les intégrations et appels IA du pilote.
- `TOKEN_ENCRYPTION_KEY` : secret AES-256 stable, à générer avec `openssl rand -base64 32` et stocker dans Netlify. Ne pas le remplacer lorsque des connexions ont été enregistrées sans prévoir leur migration.
- `PILOT_SHOP_DOMAIN` : domaine interne de la boutique, utilisé uniquement pour préremplir la connexion Shopify.

Ne jamais mettre de secret dans un commit, un message, une capture d'écran ou une variable publique.

## Shopify et IA

Configurer `SHOPIFY_CLIENT_ID` et `SHOPIFY_CLIENT_SECRET` dans Netlify et enregistrer cette URL de retour dans l'application Shopify standalone :

`https://VOTRE-SITE.netlify.app/api/connect/shopify/callback`

Scope demandé : `read_products`. Connexions → autoriser → synchroniser. La requête catalogue a été validée contre Shopify Admin GraphQL 2026-07. L'accès conversationnel à Shopify ne fournit pas de jeton permanent à cette application.

Pour les appels IA, configurer `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL` (Responses/Structured Outputs) et `OPENAI_IMAGE_MODEL` (Images Edit, qualité low, format 1024 carré). Reprendre la préparation depuis Accueil, utiliser un produit réel et sa photo. Les résultats restent en brouillon à valider. Quotas quotidiens UTC : 10 analyses et 3 images par utilisateur ; ces limites ne sont pas un plafond financier en euros.

## Meta / Instagram

Configurer `META_APP_ID`, `META_APP_SECRET`, `META_GRAPH_VERSION`, puis enregistrer :

`https://VOTRE-SITE.netlify.app/api/connect/meta/callback`

Permissions : pages_show_list, pages_read_engagement, instagram_basic, instagram_content_publish, ads_read, ads_management. Les capacités dépendent de la revue Meta et des autorisations effectives du compte. Sélection explicite d'une page liée à un compte Instagram professionnel et/ou d'un compte publicitaire.

Le pilote peut lire les métriques Meta sur 7 jours, lire/mettre en pause les campagnes existantes et préparer une publication Instagram à partir d'une photo JPEG publique Shopify avec légende validée. La publication exige vérification du container puis confirmation explicite. Les images générées et exports privés ne sont pas publiés par ce flux ; ils sont téléchargeables en PNG/SVG/vidéo pour diffusion manuelle.

## Données déjà présentes sur l'ancien site

Les identifiants utilisateurs Supabase diffèrent de ceux du site précédent. Aucune base, média ou connexion existante n'est automatiquement transféré. Conserver l'ancien site, exporter son espace depuis Paramètres et planifier un import contrôlé avec correspondance des propriétaires et copie des médias. Les comptes Shopify/Meta devront être réautorisés si les jetons ne sont pas migrés de façon sécurisée. Ne pas fermer l'ancien service avant la recette et la vérification des données.

## Développement et vérifications

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Les 27 tests portent sur la migration PostgreSQL, les politiques RLS et sur les budgets cumulés en centimes, relations et validations, OAuth signé/expiré/altéré, isolation cryptographique et erreurs externes sans répétition implicite. Les tests automatisés et le build ne prouvent pas la configuration réelle des comptes ni les politiques appliquées à votre projet Supabase. Une recette hébergée reste nécessaire : inscription/confirmation, connexion, données persistantes et isolées entre comptes, upload/lecture privés, autorisations OAuth et véritables retours fournisseur.

## Périmètre actuel

Catalogue et marque, modèles éditoriaux, plan/textes IA après activation, génération d'images depuis une photo réelle, exports PNG/SVG/vidéo, calendrier manuel, brouillons de campagnes, connexion Shopify/Meta, métriques et pause Meta, publication Instagram du pilote, journal/export.

Non livrés : Google Ads/TikTok, lancement de nouvelles annonces payantes, exécution autonome et queue durable, webhooks, facturation, équipes/RBAC/multi-boutiques, import automatique de l'ancien site, effacement libre-service complet, audit sécurité indépendant et supervision d'exploitation. Stripe n'est pas intégré conformément au choix du propriétaire.

## Architecture et protection des données

Les sessions sont vérifiées avec Supabase Auth côté serveur, jamais depuis des en-têtes ChatGPT ou un cookie utilisateur non vérifié. Les écritures contrôlent l'origine ; les requêtes imposent le propriétaire ; les jetons sont chiffrés en AES-GCM et liés à l'identité et au fournisseur. Les tables opérationnelles sont dans le schéma non exposé `marketmate`, avec RLS activée et droits navigateur révoqués. Les fichiers sont privés et servis via des routes vérifiant leur propriétaire.

La base reste un document JSON par espace, avec révision atomique pour les onglets concurrents. Le journal utilisateur conserve 500 événements et n'est pas un registre d'audit immuable. Les opérations à résultat incertain ne sont pas relancées automatiquement.
