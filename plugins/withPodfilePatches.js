const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Due correzioni al Podfile che la generazione automatica non fa.
 *
 * Servono perche' `ios/` non sta nel repository: a ogni build EAS rigenera il
 * progetto nativo da zero e risolve i pod da capo, quindi una patch applicata
 * a mano sul portatile non arriva mai in cloud. Senza queste righe la build
 * fallisce prima di compilare.
 *
 * 1. Con i framework statici (ios.useFrameworks in app.json, necessario per i
 *    pod Swift di Google) `AppCheckCore` non si integra: dipende da
 *    GoogleUtilities e RecaptchaInterop, che non definiscono moduli.
 *    Dichiararli qui genera le module map. Meglio che `use_modular_headers!`
 *    globale, che toccherebbe anche i pod di React Native.
 *
 * 2. Xcode 26 e successivi rifiutano i deployment target sotto iOS 15, e una
 *    dozzina di pod ne dichiara ancora 9.0 o 12.0. Li allinea al minimo.
 */
const MINIMO_IOS = '15.1';

const MODULAR_HEADERS = `
  # Aggiunto da plugins/withPodfilePatches.js
  pod 'GoogleUtilities', :modular_headers => true
  pod 'RecaptchaInterop', :modular_headers => true
  pod 'AppCheckCore', :modular_headers => true
`;

const DEPLOYMENT_TARGET = `
    # Aggiunto da plugins/withPodfilePatches.js
    minimo_ios = '${MINIMO_IOS}'
    [installer.pods_project, *installer.generated_projects].compact.each do |progetto|
      progetto.targets.each do |target|
        target.build_configurations.each do |config|
          attuale = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
          if attuale.nil? || attuale.to_f < minimo_ios.to_f
            config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = minimo_ios
          end
        end
      end
    end
`;

function applica(podfile) {
  let risultato = podfile;

  if (!risultato.includes("pod 'AppCheckCore'")) {
    const ancora = "use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']";
    if (!risultato.includes(ancora)) {
      throw new Error(
        '[withPodfilePatches] riga use_frameworks non trovata: il Podfile generato è cambiato',
      );
    }
    risultato = risultato.replace(ancora, ancora + '\n' + MODULAR_HEADERS);
  }

  if (!risultato.includes('minimo_ios')) {
    const ancora = '  post_install do |installer|';
    if (!risultato.includes(ancora)) {
      throw new Error(
        '[withPodfilePatches] blocco post_install non trovato: il Podfile generato è cambiato',
      );
    }
    risultato = risultato.replace(ancora, ancora + '\n' + DEPLOYMENT_TARGET);
  }

  return risultato;
}

module.exports = function withPodfilePatches(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const percorso = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      const podfile = fs.readFileSync(percorso, 'utf8');
      fs.writeFileSync(percorso, applica(podfile), 'utf8');
      return cfg;
    },
  ]);
};

// Esportata per i test: la logica sta tutta qui ed è pura.
module.exports.applica = applica;
