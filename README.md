# Appli Weild Weeks

Application mobile des **Weild Weeks** (intégration des 1A de CentraleSupélec) et du **WEI**.
Elle centralise le programme, la carte du campus, la famille de parrainage et les annonces du bureau WEI.

Projet du pôle projet WEI 2026-2027 (Elian Jacquet, Corentin Prizzon), client : bureau WEI, partenaire technique : ViaRézo.

## Organisation du dépôt

```
app/                 appli mobile Expo (React Native + TypeScript, expo-router)
  src/app/           les écrans (un fichier = un écran, voir expo-router)
  src/api/           appels à l'API
  src/auth/          session (connexion / déconnexion)
  src/i18n/          textes de l'interface (fr, en)
  src/theme.ts       couleurs et polices (reprises du prototype)
api/                 API REST Node.js + TypeScript (Express, Prisma, PostgreSQL)
  prisma/            schéma de la base et migrations SQL
  src/routes/        une route par fichier
  src/seed.ts        données FICTIVES pour le développement
admin/               back-office web (pages statiques, servi sur /admin) — à venir
docker-compose.yml   PostgreSQL + API en local
docs/                prototype cliquable des écrans (référence visuelle)
```

Onglets de l'appli : Accueil, Calendrier, Carte, Favoris, Profil. Le shotgun n'a pas d'onglet : le bouton est sur la page de détail de l'événement, visible seulement par le chef de famille.

## Lancer le projet en local

Prérequis : [Node.js 24](https://nodejs.org), [Docker Desktop](https://www.docker.com/products/docker-desktop/), et l'appli **Expo Go** sur ton téléphone.

```sh
git clone https://github.com/Tinrenco/Application-Weild-Weeks.git
cd Application-Weild-Weeks
docker compose up --build -d                 # base de données + API (migrations automatiques)
docker compose exec api npm run db:seed      # données fictives
cd app
npm install
cp .env.example .env.local                   # puis mets l'IP de ton ordi (voir le fichier)
npx expo start                               # scanne le QR code avec Expo Go
```

Vérifier que l'API tourne : http://localhost:3000/api/health doit répondre `{"status":"ok","database":"ok"}`.

Dans l'appli, l'écran de connexion propose une **connexion de développement** : on choisit un utilisateur de test (orga, chef de famille, 1A sans famille…). Elle n'existe que tant que la variable `DEV_LOGIN_ENABLED=true` est définie, et que l'appli tourne en mode développement. Elle sera remplacée par la connexion ViaRézo dès qu'on aura le client OAuth.

### Développer l'API sans la reconstruire à chaque fois

```sh
docker compose up -d db          # seulement PostgreSQL
cd api
cp .env.example .env
npm install
npm run db:deploy && npm run db:seed
npm run dev                      # redémarre à chaque modification
```

## Commandes utiles

| Où | Commande | Effet |
|---|---|---|
| `api/` | `npm run dev` | API en mode développement |
| `api/` | `npm run db:migrate -- --name xxx` | crée une migration après modification de `prisma/schema.prisma` |
| `api/` | `npm run db:seed` | remet les données fictives (efface la base) |
| `api/` | `npm run db:studio` | interface web pour voir/modifier la base |
| `app/` | `npx expo start` | lance l'appli |
| les deux | `npm run lint` / `npm run typecheck` | vérifications (lancées aussi par la CI) |
| racine | `docker compose down -v` | arrête tout **et supprime la base** |

## Base de données

Le schéma est dans [api/prisma/schema.prisma](api/prisma/schema.prisma). Les noms sont en anglais dans le code et en snake_case dans PostgreSQL :

| Table | Rôle |
|---|---|
| `users` | élèves et orgas (créés à la connexion ViaRézo), avec leur famille et le rôle de chef |
| `families` | familles de parrainage — un seul chef par famille (index unique partiel) |
| `events`, `places`, `associations`, `event_associations` | programme, lieux de la carte, assos organisatrices |
| `favorites` | événements mis en favori |
| `announcements` | annonces du bureau WEI |
| `settings` | réglages clé/valeur modifiables sans redéployer (ex. contact pour changer de famille) |

Pour modifier le schéma : édite `schema.prisma`, lance `npm run db:migrate -- --name ce_qui_change`, puis commite le schéma **et** le dossier de migration créé.

## Règles du projet

- **Transmission avant tout** : du code simple et commenté, pour que la promo suivante puisse le reprendre.
- TypeScript strict partout. Code, commentaires et messages de commit en anglais.
- Interface en français ; tous les textes passent par `app/src/i18n` (la version anglaise est prête à brancher).
- **Aucune donnée personnelle réelle** dans le code, les tests, les données d'exemple ou un outil d'IA.
- IA autorisée comme assistant, mais personne ne fusionne du code qu'il ne sait pas expliquer.
- Après `npm install`, npm peut demander d'autoriser des scripts d'installation (`npm install-scripts ls`) : ceux déjà autorisés sont listés dans `allowScripts` des `package.json`.

## Planning

Fin du projet le 31 janvier 2027 : socle (S1-S2), connexion ViaRézo et profil, calendrier, espace orga, famille, accueil, carte, shotguns, démo au bureau WEI le 18 décembre, tests en janvier, publication sur les stores avec les comptes ViaRézo, puis passation.
