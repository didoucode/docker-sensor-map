#  Docker Sensor Map App

Application containerisée qui importe des données de capteurs de trafic depuis un fichier CSV, les stocke dans MongoDB et les visualise sur une **carte interactive** avec des points rouges.

##  Architecture

```
CSV File → api (Node.js :3001) → MongoDB (:27018) → Carte Leaflet
```

##  Structure du projet

```
app2-sensors/
├── Dockerfile
├── package.json
├── service.js              ← API Express + import CSV + MongoDB
├── map.html                ← Carte interactive Leaflet
└── sensor_metadata.csv     ← Données des capteurs (325 entrées)
```

##  Technologies

- **Node.js** + Express
- **MongoDB** + Mongoose
- **Docker** (2 containers)
- **CSV Parser** — lecture du fichier de données
- **Leaflet.js** — carte interactive OpenStreetMap
- **HTML / CSS / JS** — interface web

##  Données

Le fichier `sensor_metadata.csv` contient **325 capteurs** de trafic autoroutier dans la région de **San José, Californie** avec les champs suivants :

| Champ | Description |
|---|---|
| Sensor ID | Identifiant unique du capteur |
| Freeway | Numéro de l'autoroute |
| Direction | Direction (N/S/E/W) |
| Postmile | Position sur l'autoroute |
| Latitude | Coordonnée GPS |
| Longitude | Coordonnée GPS |
| Length (km) | Longueur du segment |
| Lanes | Nombre de voies |

##  Lancement avec Dockerfile

### 1. Créer le réseau Docker
```bash
docker network create sensor-network
```

### 2. Lancer MongoDB
```bash
docker run -d \
  --name mongo-sensor \
  --network sensor-network \
  -p 27018:27017 \
  mongo
```

### 3. Builder l'image
```bash
docker build -t sensor-app .
```

### 4. Lancer le container
```bash
docker run -d \
  --name sensor-app \
  --network sensor-network \
  -p 3001:3000 \
  sensor-app
```

### 5. Vérifier que les containers tournent
```bash
docker ps
```
Résultat:

| Nom | Image | Port |
|---|---|---|
| mongo-sensor | mongo | 27018 |
| sensor-app | sensor-app | 3001 |

##  Endpoints

| Route | Description |
|---|---|
| `GET /import` | Lit le CSV et stocke les 325 capteurs dans MongoDB |
| `GET /sensors` | Retourne tous les capteurs en JSON |
| `GET /map.html` | Carte interactive avec les points rouges |

##  Utilisation

### Étape 1 — Importer les données
```
http://localhost:3001/import
```
Réponse attendue : ` 325 capteurs importés dans MongoDB`

### Étape 2 — Afficher la carte
```
http://localhost:3001/map.html
```

##  Fonctionnalités de la carte

-  **325 points rouges** sur la carte OpenStreetMap
-  **Zoom automatique** sur la zone San José
-  **Popup au clic** — affiche les détails du capteur
-  **Point agrandi au hover**
-  **Filtres par autoroute** — Hwy 101, 85, 880, 280...
-  **Stats en temps réel** — total, autoroutes, points visibles

##  Redémarrage après arrêt de Docker

```bash
docker start mongo-sensor
docker start sensor-app
```

##  Nettoyage

```bash
docker stop sensor-app mongo-sensor
docker rm sensor-app mongo-sensor
docker network rm sensor-network
