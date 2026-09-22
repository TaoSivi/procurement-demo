/**
 * ============================================================
 *  Backend ສຳລັບ "ລະບົບຈັດຊື້ຈັດຈ້າງ (ຕົວຢ່າງ)" — Google Apps Script + Google Sheets
 * ============================================================
 *  ໜ້າທີ່: ເກັບຂໍ້ມູນທັງໝົດຂອງແອັບ (settings, vendors, prs, pos, grns, auditLogs, users, seq)
 *  ເປັນ JSON ກ້ອນດຽວໃນ Sheet — ໃຫ້ທຸກເຄື່ອງ/ທຸກຄົນເຫັນຂໍ້ມູນຊຸດດຽວກັນ (shared).
 *
 *  ວິທີຕິດຕັ້ງ (5 ຂັ້ນຕອນ):
 *   1. ໄປ https://sheets.google.com ສ້າງ Google Sheet ໃໝ່ 1 ອັນ (ຕັ້ງຊື່ຫຍັງກໍໄດ້).
 *   2. ເມນູ Extensions → Apps Script → ລຶບໂຄ້ດເກົ່າ ແລ້ວ paste ໄຟລ໌ນີ້ທັງໝົດ.
 *   3. ກົດ Deploy → New deployment → ເລືອກ type = "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      ກົດ Deploy → ອະນຸຍາດສິດ (Authorize).
 *   4. ກັອບ "Web app URL" (ລົງທ້າຍດ້ວຍ /exec).
 *   5. ເປີດແອັບ → ໜ້າ login → "⚙ ຕັ້ງຄ່າ Google Sheet Sync" → ວາງ URL ນັ້ນ → ຕົກລົງ.
 *
 *  ໝາຍເຫດ: 1 cell ເກັບໄດ້ ~50,000 ຕົວອັກສອນ. ສຳລັບ demo ພຽງພໍ.
 *  ຖ້າອັບໄຟລ໌ແນບ (base64) ຫຼາຍ ອາດເກີນ — ຄວນປິດການແນບໄຟລ໌ໃນໂໝດ sync ຫຼືຍ້າຍໄປ Drive.
 */

var SHEET_NAME = 'STATE';   // ເກັບ JSON state ໃນ cell A1
var LOG_NAME   = 'LOG';     // ບັນທຶກປະຫວັດການ save (timestamp)

function _stateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.getRange('A1').setValue(''); }
  return sh;
}
function _logSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LOG_NAME);
  if (!sh) { sh = ss.insertSheet(LOG_NAME); sh.appendRow(['ເວລາ', 'ຂະໜາດ (bytes)']); }
  return sh;
}

// GET → ຄືນ JSON state ຫຼ້າສຸດ (ຫຼື {} ຖ້າຍັງບໍ່ມີ)
function doGet(e) {
  var raw = _stateSheet_().getRange('A1').getValue();
  var out = (raw && String(raw).length) ? String(raw) : '{}';
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

// POST → ບັນທຶກ JSON state ທັງກ້ອນ (ຂຽນທັບ)
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // ກັນຂຽນຊ້ອນກັນ
    var body = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    // ກວດວ່າເປັນ JSON ທີ່ຖືກຕ້ອງກ່ອນ save
    JSON.parse(body);
    _stateSheet_().getRange('A1').setValue(body);
    _logSheet_().appendRow([new Date(), body.length]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, saved: body.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}
