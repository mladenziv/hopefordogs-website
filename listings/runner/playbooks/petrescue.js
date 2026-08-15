// petrescue.be playbook (/pet/create).
// Verify labels/kinds with a headed `--dry-run`; adjust anything the log reports.
import { fillText, selectField, radioField, checkField, uploadPhotos } from '../lib/fill.js';

export const meta = { key: 'petrescue', label: 'Pet Rescue' };

// [ payloadFieldKey, formLabel, kind ]  (kind: 'text'|'select'|'radio'|'check')
// geslacht is a radio (mannelijk/vrouwelijk) → matched by its VALUE, not a label.
const FIELDS = [
  ['naam', 'Naam dier', 'text'],
  ['geslacht', null, 'radio'],
  ['birth_date', 'Birth Date', 'text'],
  ['categorie', 'Categorie', 'select'],
  ['is_gechipped', 'Is gechipped', 'check'],
  ['is_gevaccineerd', 'Is gevaccineerd', 'check'],
  ['is_gevaccineerd_rabies', 'Is gevaccineerd tegen rabiës', 'check'],
  ['is_gesteriliseerd', 'Is gesteriliseerd', 'check'],
  ['beschrijving_nl', 'Beschrijving nl', 'text'],
  ['beschrijving_en', 'Beschrijving en', 'text'],
  ['beschrijving_fr', 'Beschrijving fr', 'text'],
  ['kan_met_kinderen', 'Kan met kinderen', 'check'],
  ['kan_met_soortgenoten', 'Kan met soortgenoten', 'check'],
  ['kan_met_andere_dieren', 'Kan met andere dieren', 'check'],
  ['adoptiekost', 'Adoptiekost', 'text'],
  ['locatie_land', 'Locatie land', 'select'],
  ['region', 'Region', 'text'],
  ['zoekt', 'zoekt', 'select'],
  ['email', 'E-mail', 'text'],
  ['telefoon', 'Telefoon', 'text'],
  ['status', 'status', 'select']
];

export async function fill(page, values, photoPaths, log) {
  for (const [key, label, kind] of FIELDS) {
    const v = values[key];
    if (kind === 'select') await selectField(page, label, v, log);
    else if (kind === 'radio') await radioField(page, v, log);
    else if (kind === 'check') await checkField(page, label, v, log);
    else await fillText(page, label, v, log);
  }
  await uploadPhotos(page, photoPaths, log);
}
