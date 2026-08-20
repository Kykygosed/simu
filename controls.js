/**
 * controls.js
 * -----------
 * Contrôles clavier CACHÉS (aucun overlay affiché à l'écran) :
 *
 *   Flèche haut / bas     -> pitch du yoke (cabrer / piquer)
 *   Flèche gauche / droite-> roll du yoke (incliner à gauche / droite)
 *   Page Up / Page Down   -> manette des gaz (throttle +/-)
 *
 * Ce module ne calcule aucune physique : il transforme l'état des touches
 * en un objet `controls` normalisé, lu par le moteur de simulation dans
 * index.html. Il écrit aussi ces commandes brutes dans
 * sim/controls/* pour que d'autres écrans (ex: futur indicateur de
 * manette des gaz) puissent les afficher si besoin.
 */

const KeyboardControls = {
  _keys: {},
  throttle: 0.5, // 0..1, la manette garde sa position (pas de rappel au centre)

  init() {
    window.addEventListener("keydown", (e) => {
      this._keys[e.code] = true;
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "PageUp",
          "PageDown"
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this._keys[e.code] = false;
    });
  },

  /** À appeler à chaque tick de simulation. dt en secondes. */
  read(dt) {
    const pitch = (this._keys["ArrowDown"] ? 1 : 0) - (this._keys["ArrowUp"] ? 1 : 0);
    const roll = (this._keys["ArrowRight"] ? 1 : 0) - (this._keys["ArrowLeft"] ? 1 : 0);
    const yaw = 0; // pas de pédales assignées pour l'instant

    const throttleRate = 0.4; // 0..1 par seconde à PageUp/PageDown maintenu
    if (this._keys["PageUp"]) this.throttle += throttleRate * dt;
    if (this._keys["PageDown"]) this.throttle -= throttleRate * dt;
    this.throttle = Math.min(1, Math.max(0, this.throttle));

    return { pitch, roll, yaw, throttle: this.throttle };
  }
};
