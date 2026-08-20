/**
 * flight-physics.js
 * -----------------
 * Moteur physique du simulateur.
 *
 * ⚠️ À PROPOS DE JSBSim
 * Le cahier des charges demande d'intégrer JSBSim. JSBSim est une librairie
 * C++ ; pour tourner dans un navigateur, il faut une build WebAssembly
 * (ex: projet "jsbsim-wasm" / "flightgear-wasm"), qu'il faut compiler ou
 * récupérer séparément, embarquer un fichier .wasm, et lui fournir un
 * fichier de configuration d'avion au format XML JSBSim (masse, surfaces,
 * moteurs, coefficients aérodynamiques...). Comme l'avion est encore
 * entièrement fictif et non défini, il n'y a pas encore de fichier avion
 * JSBSim à charger, et je ne veux pas inventer ces caractéristiques à ta
 * place.
 *
 * Ce fichier fournit donc, pour cette première version, un modèle physique
 * volontairement simple mais isolé derrière l'interface `FlightModel`.
 * Le jour où tu veux brancher un vrai JSBSim-WASM, il suffira d'écrire une
 * nouvelle classe qui respecte la même interface (update(dt, controls) ->
 * state) et de la substituer ici, sans toucher au reste du projet
 * (Firebase, Cesium, écrans).
 */

class FlightModel {
  constructor(initialState) {
    this.state = Object.assign(
      {
        // Position
        latitude: 48.8566, // Paris
        longitude: 2.3522,
        altitude: 5791.2, // mètres (~19000 ft)

        // Attitude (degrés)
        heading: 0,
        pitch: 0,
        roll: 0,

        // Performances
        airspeed: 250, // m/s (~486 kt), valeur de départ arbitraire de test
        verticalSpeed: 0, // m/s
        acceleration: 0, // m/s²

        // Moteurs (0-100, simple pourcentage de poussée pour l'instant)
        engine1Thrust: 50,
        engine2Thrust: 50
      },
      initialState || {}
    );
  }

  /**
   * Avance la simulation de dt secondes en fonction des commandes.
   * controls = { pitch, roll, yaw, throttle } chacun dans [-1, 1] (ou [0,1]
   * pour throttle), tel que produit par js/controls.js.
   *
   * Modèle volontairement simple (point-mass, pas d'aérodynamique réelle) :
   * il sert à faire vivre l'architecture, pas à représenter un vrai avion.
   */
  update(dt, controls) {
    const s = this.state;
    const c = controls || { pitch: 0, roll: 0, yaw: 0, throttle: 0.5 };

    // --- Commandes de vol : vitesses angulaires simples ---
    const rollRate = 45; // deg/s à déflexion max
    const pitchRate = 20; // deg/s à déflexion max
    const yawRate = 10; // deg/s à déflexion max (couplage roulis->lacet simplifié)

    s.roll += c.roll * rollRate * dt;
    s.roll = clamp(s.roll, -75, 75);

    s.pitch += c.pitch * pitchRate * dt;
    s.pitch = clamp(s.pitch, -45, 45);

    // Le lacet + une part du roulis fait tourner le cap (virage coordonné très simplifié)
    const turnFromRoll = (s.roll / 75) * 6; // deg/s max induits par le roulis
    s.heading += (c.yaw * yawRate + turnFromRoll) * dt;
    s.heading = ((s.heading % 360) + 360) % 360;

    // --- Moteurs / poussée ---
    const throttleTarget = clamp(c.throttle, 0, 1) * 100;
    s.engine1Thrust = approach(s.engine1Thrust, throttleTarget, 20 * dt);
    s.engine2Thrust = approach(s.engine2Thrust, throttleTarget, 20 * dt);
    const meanThrust = (s.engine1Thrust + s.engine2Thrust) / 2;

    // --- Vitesse air : la poussée accélère, une trainée freine ---
    const targetSpeed = 50 + (meanThrust / 100) * 280; // m/s, plage 50 - 330
    const prevSpeed = s.airspeed;
    s.airspeed = approach(s.airspeed, targetSpeed, 15 * dt);
    s.acceleration = (s.airspeed - prevSpeed) / dt || 0;

    // --- Vitesse verticale : dépend du pitch et un peu de la poussée ---
    const targetVS = Math.sin(deg2rad(s.pitch)) * s.airspeed;
    s.verticalSpeed = approach(s.verticalSpeed, targetVS, 10 * dt);
    s.altitude += s.verticalSpeed * dt;
    s.altitude = Math.max(0, s.altitude);

    // --- Position : déplacement selon le cap et la vitesse air ---
    const distance = s.airspeed * dt; // mètres parcourus ce pas de temps
    const earthRadius = 6371000;
    const headingRad = deg2rad(s.heading);
    const dLat = (distance * Math.cos(headingRad)) / earthRadius;
    const dLon =
      (distance * Math.sin(headingRad)) /
      (earthRadius * Math.cos(deg2rad(s.latitude)));

    s.latitude += rad2deg(dLat);
    s.longitude += rad2deg(dLon);

    return s;
  }
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function approach(current, target, maxStep) {
  const diff = target - current;
  if (Math.abs(diff) <= maxStep) return target;
  return current + Math.sign(diff) * maxStep;
}

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function rad2deg(r) {
  return (r * 180) / Math.PI;
}
