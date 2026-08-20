# Simulateur de vol — v1 (architecture)

Première version demandée : infrastructure fonctionnelle, pas un avion fini.

## Fichiers

```
index.html          Vue extérieure Cesium + moteur de simulation + clavier
pfd.html             Primary Flight Display (lecture Firebase seule)
nd.html               Navigation Display (lecture Firebase seule)
upper_ecam.html    Écran système supérieur, valeurs de test
lower_ecam.html    Écran système inférieur, valeurs de test
mcdu.html            MCDU minimal (lecture + écriture Firebase)
js/firebase-config.js   Connexion Firebase partagée (SimIO.watch/set/update)
js/flight-physics.js    Classe FlightModel — modèle physique simple, isolé
js/controls.js          Lecture clavier cachée (flèches + PageUp/PageDown)
css/instruments.css     Style commun aux écrans instruments
```

## Comment lancer

Ce sont des pages statiques : elles doivent être servies par un petit serveur
HTTP local (pas juste ouvertes en double-clic), sinon certains navigateurs
bloquent les scripts. Par exemple, depuis ce dossier :

```
python3 -m http.server 8080
```

puis ouvrir `http://localhost:8080/index.html`, `http://localhost:8080/pfd.html`, etc.
— un onglet ou un écran par page, comme prévu dans le cahier des charges.

## Commandes clavier (cachées, sans overlay)

- Flèches ↑ / ↓ : pitch du yoke (cabrer / piquer)
- Flèches ← / → : roll du yoke (incliner)
- Page Up / Page Down : manette des gaz (throttle +/-)

Ces touches doivent être utilisées avec `index.html` au premier plan (c'est
la page qui héberge la boucle de simulation).

## Décisions prises pour cette v1 (à valider ou changer par toi)

1. **Le moteur de simulation tourne dans `index.html`.** C'est la page
   forcément ouverte (vue Cesium), donc un endroit naturel pour la boucle
   physique. Si tu préfères un moteur détaché de tout écran (ex: une page
   cachée dédiée), c'est facile à extraire plus tard — dis-le moi.

2. **JSBSim n'est pas encore branché.** JSBSim est une librairie C++ ; pour
   le faire tourner dans un navigateur il faut une build WebAssembly (le
   `.wasm` n'existe pas dans ce projet) et un fichier avion au format XML
   JSBSim (masse, moteurs, aérodynamique...) — que je ne peux pas inventer
   puisque l'avion n'est pas encore défini. `js/flight-physics.js` fournit
   à la place un modèle simple, isolé derrière une interface
   `update(dt, controls) -> state`, pour que le remplacement par un vrai
   JSBSim-WASM plus tard ne touche aucun autre fichier du projet.

3. **Spawn** : 19000 ft (5791,2 m) au-dessus de Paris (48.8566, 2.3522), cap
   90° arbitraire, vitesse air de départ arbitraire (220 m/s) — juste pour
   avoir un point de départ testable.

4. **Règles de sécurité Firebase** : rien n'est précisé dans le cahier des
   charges, donc rien n'est configuré ici. Par défaut, une base Firebase
   Realtime Database neuve refuse toute lecture/écriture tant que les
   règles ne l'autorisent pas explicitement. Pour tester ce projet, il
   faudra dans la console Firebase autoriser au moins la lecture/écriture
   sous `sim/` (en développement uniquement — à restreindre avant tout
   usage public, la config ci-incluse contenant une clé API cliente).

## Ce qui reste volontairement non fait (comme demandé)

- Pas de modèle 3D d'avion, pas de HUD, pas d'instruments superposés à Cesium.
- Pas d'avionique définitive pour le PFD/ND (juste des valeurs numériques brutes).
- Pas d'intégration ESP32.
- Pas de physique de vol réaliste (modèle "point-mass" simple, à remplacer).
