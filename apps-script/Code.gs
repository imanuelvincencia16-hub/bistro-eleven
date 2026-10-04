/* Bistro Eleven Apps Script web app: ledger rows into the sheet, board copy into Drive. */

const SHEET_NAME = "Sheet1";
const STATE_FILE = "bistro-eleven-state.json";
const HEAD = ["Waktu", "Nomor pesanan", "Nama customer", "Tipe pesanan",
              "Alamat / No. meja", "Daftar makanan", "Catatan", "Total harga"];

function target() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function ok(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function stateFile() {
  const found = DriveApp.getFilesByName(STATE_FILE);
  return found.hasNext() ? found.next() : DriveApp.createFile(STATE_FILE, "", "text/plain");
}

function loadState() {
  const f = stateFile();
  const txt = f.getBlob().getDataAsString("UTF-8");
  const box = txt ? JSON.parse(txt) : null;
  return {
    ok: true,
    saved: box && box.savedAt ? box.savedAt : "",
    state: box && box.state ? box.state : null,
    file: f.getName()
  };
}

function append(p) {
  const sh = target();
  const ss = sh.getParent();
  const last = sh.getLastRow();
  if (last === 0 || String(sh.getRange(1, 2).getValue()).trim() === "") {
    sh.getRange(1, 1, 1, 8).setValues([HEAD]);
  }
  const row = (p.row || []).slice(0, 8).map(v => String(v == null ? "" : v));
  const ids = last ? sh.getRange(1, 2, last, 1).getValues().flat().map(v => String(v).trim()) : [];
  const dup = ids.indexOf(String(p.id).trim()) !== -1;
  if (!dup) sh.getRange(last + 1, 1, 1, 8).setValues([row]);
  return {
    ok: true, skipped: dup, tab: sh.getName(), lastRow: sh.getLastRow(),
    file: ss.getName(), fileId: ss.getId(), url: ss.getUrl()
  };
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.action === "load") return ok(loadState());
    if (p.action === "save") {
      const savedAt = new Date().toISOString();
      stateFile().setContent(JSON.stringify({ savedAt: savedAt, state: p.state }), "text/plain");
      return ok({ ok: true, saved: savedAt });
    }
    return ok(append(p));
  } catch (err) {
    return ok({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
