/**
 * firebase-config.js
 * -------------------
 * Point d'entrée Firebase unique. Chaque page (index, pfd, nd, ecam, mcdu)
 * inclut ce fichier APRÈS les <script> du SDK Firebase compat, puis peut
 * utiliser la variable globale `simDB` (référence vers la racine "sim").
 *
 * On utilise le SDK "compat" (et non les modules ES) pour rester simple :
 * pas de bundler, chaque page HTML est autonome.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBP7...",
  authDomain: "kykychat-24c7f.firebaseapp.com",
  databaseURL: "https://kykychat-24c7f-default-rtdb.firebaseio.com",
  projectId: "kykychat-24c7f",
  storageBucket: "kykychat-24c7f.firebasestorage.app",
  messagingSenderId: "342562811927",
  appId: "1:342562811927:web:0fed1e1f511c4fddcfec52"
};

// Évite une double initialisation si le script est chargé deux fois.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// Référence pratique vers la racine de l'état partagé du simulateur.
const simRef = database.ref("sim");

/**
 * Petits helpers réutilisés par toutes les pages d'affichage.
 * Ils NE CALCULENT RIEN : ils lisent/écrivent seulement dans Firebase.
 */
const SimIO = {
  /** Écoute un chemin sous "sim" et appelle cb(valeur) à chaque changement. */
  watch(path, cb) {
    simRef.child(path).on("value", (snap) => cb(snap.val()));
  },

  /** Écrit une valeur unique à un chemin donné sous "sim". */
  set(path, value) {
    simRef.child(path).set(value);
  },

  /** Écrit plusieurs valeurs en une seule requête (update multi-chemins). */
  update(pathValueMap) {
    simRef.update(pathValueMap);
  }
};
