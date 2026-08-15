// Resilient, self-logging field fillers.
// We can't see the live DOM, so each helper tries several locator strategies
// (accessible label → placeholder → role) and LOGS what worked or failed —
// non-fatal, so a headed `--dry-run` shows exactly which fields need a tweak.

async function firstVisible(page, makers) {
  for (const make of makers) {
    try {
      const loc = make();
      if ((await loc.count()) && (await loc.first().isVisible())) return loc.first();
    } catch (e) { /* try next strategy */ }
  }
  return null;
}

export async function fillText(page, label, value, log) {
  if (value == null || value === '') return;
  const loc = await firstVisible(page, [
    () => page.getByLabel(label, { exact: false }),
    () => page.getByPlaceholder(label, { exact: false }),
    () => page.getByRole('textbox', { name: label })
  ]);
  if (!loc) { log(`  ? veld niet gevonden: "${label}"`); return; }
  try { await loc.fill(String(value)); log(`  ✓ ${label}`); }
  catch (e) { log(`  ! kon "${label}" niet invullen: ${e.message}`); }
}

export async function selectField(page, label, value, log) {
  if (value == null || value === '') return;
  const v = String(value);

  // 1) Native <select>: selectOption by label, then by value.
  const native = await firstVisible(page, [
    () => page.getByLabel(label, { exact: false }),
    () => page.getByRole('combobox', { name: label })
  ]);
  if (native) {
    try { await native.selectOption({ label: v }); log(`  ✓ ${label} = ${v}`); return; } catch (e) {}
    try { await native.selectOption(v); log(`  ✓ ${label} = ${v}`); return; } catch (e) {}
    // Native locator but selectOption failed → likely a custom widget; try clicking it.
    if (await clickOpenAndPick(page, native, v, log, label)) return;
  }

  // 2) Custom dropdown: find the trigger by its placeholder/label text, open, pick.
  const trigger = await firstVisible(page, [
    () => page.getByRole('combobox', { name: label }),
    () => page.locator(`[placeholder="${label}"]`),
    () => page.getByText(label, { exact: true })
  ]);
  if (trigger && await clickOpenAndPick(page, trigger, v, log, label)) return;

  log(`  ! keuzelijst "${label}" → "${v}" niet gelukt (custom dropdown — stuur me de \`playwright codegen\`-regel voor dit veld).`);
}

// Open a custom dropdown and click the option whose visible text matches value.
async function clickOpenAndPick(page, trigger, value, log, label) {
  try {
    await trigger.click();
    const opt = await firstVisible(page, [
      () => page.getByRole('option', { name: value, exact: true }),
      () => page.getByRole('option', { name: value, exact: false }),
      () => page.locator('[role=option], li, .option').filter({ hasText: value })
    ]);
    if (opt) { await opt.click(); log(`  ✓ ${label} = ${value} (custom)`); return true; }
  } catch (e) {}
  return false;
}

export async function radioField(page, value, log) {
  if (value == null || value === '') return;
  const loc = await firstVisible(page, [
    () => page.getByLabel(String(value), { exact: false }),
    () => page.getByRole('radio', { name: String(value) })
  ]);
  if (!loc) { log(`  ? keuzerondje niet gevonden: "${value}"`); return; }
  try { await loc.check(); log(`  ✓ ${value}`); }
  catch (e) { log(`  ! kon "${value}" niet aanvinken: ${e.message}`); }
}

export async function checkField(page, label, value, log) {
  const loc = await firstVisible(page, [
    () => page.getByLabel(label, { exact: false }),
    () => page.getByRole('checkbox', { name: label })
  ]);
  if (!loc) { log(`  ? checkbox niet gevonden: "${label}"`); return; }
  try { await loc.setChecked(!!value); log(`  ✓ ${label} = ${value ? 'aan' : 'uit'}`); }
  catch (e) { log(`  ! kon checkbox "${label}" niet zetten: ${e.message}`); }
}

export async function uploadPhotos(page, photoPaths, log) {
  if (!photoPaths || !photoPaths.length) return;
  const input = page.locator('input[type=file]').first();
  try { await input.setInputFiles(photoPaths); log(`  ✓ ${photoPaths.length} foto('s) geüpload`); }
  catch (e) { log(`  ! foto-upload faalde (pas de file-input selector in de playbook aan): ${e.message}`); }
}

// Upload by clicking a button/text that opens the OS file chooser (baasjegezocht's
// "Upload bestand"). Falls back to a hidden <input type=file> if no chooser fires.
export async function uploadViaChooser(page, containerSel, buttonText, photoPaths, log) {
  if (!photoPaths || !photoPaths.length) return;
  const scope = containerSel ? page.locator(containerSel) : page;
  try {
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 8000 }),
      scope.getByText(buttonText, { exact: false }).first().click()
    ]);
    await chooser.setFiles(photoPaths);
    log(`  ✓ ${photoPaths.length} foto('s) via "${buttonText}"`);
  } catch (e) {
    try { await page.locator((containerSel ? containerSel + ' ' : '') + 'input[type=file]').first().setInputFiles(photoPaths); log(`  ✓ ${photoPaths.length} foto('s) (verborgen input)`); }
    catch (e2) { log(`  ! foto-upload faalde: ${e.message}`); }
  }
}
