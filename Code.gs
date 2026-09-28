/**
 * ============================================================
 *  Backend ສຳລັບ "ລະບົບຈັດຊື້ຈັດຈ້າງ (ຕົວຢ່າງ)" — Google Apps Script + Google Sheets + Google Drive
 * ============================================================
 *  ໜ້າທີ່:
 *   1) ເກັບຂໍ້ມູນທັງໝົດຂອງແອັບ (settings, vendors, prs, pos, grns, advances, auditLogs, users, seq)
 *      ເປັນ JSON ກ້ອນດຽວໃນ Sheet — ໃຫ້ທຸກເຄື່ອງເຫັນຂໍ້ມູນຊຸດດຽວກັນ.
 *   2) ເກັບໄຟລ໌ແນບ (ຮູບໃບບິນ ເບີກລ່ວງໜ້າ) ໃນໂຟເດີ Google Drive ຂອງທ່ານ — ໄຟລ໌ເປັນ "ສ່ວນຕົວ" (ບໍ່ແຊລິ້ງ),
 *      ແອັບດຶງເບິ່ງຜ່ານ script ນີ້ເທົ່ານັ້ນ.
 *
 *  ວິທີຕິດຕັ້ງ / ອັບເດດ:
 *   1. ເປີດ Google Sheet → Extensions → Apps Script → ລຶບໂຄ້ດເກົ່າ ແລ້ວ paste ໄຟລ໌ນີ້ທັງໝົດ → Save.
 *   2. Deploy → Manage deployments → ✏ (ແກ້ deployment ເດີມ) → Version: New version → Deploy
 *      (ໃຊ້ deployment ເດີມ = URL ບໍ່ປ່ຽນ). ຄັ້ງທຳອິດ: Deploy → New deployment → Web app,
 *      Execute as: Me, Who has access: Anyone.
 *   3. ຈະມີໜ້າຂໍສິດເພີ່ມ (Google Drive) → Authorize. ສະບັບນີ້ຕ້ອງການສິດ Drive ເພື່ອເກັບຮູບໃບບິນ.
 *   4. ກັອບ "Web app URL" (ລົງທ້າຍ /exec) → ແອັບ → ໜ້າ login → "⚙ ຕັ້ງຄ່າ Google Sheet Sync" → ວາງ URL.
 *
 *  ໝາຍເຫດ:
 *   - 1 cell ເກັບໄດ້ ~50,000 ຕົວອັກສອນ — ຮູບໃບບິນຈຶ່ງເກັບໃນ Drive ແທນ (state ເກັບແຕ່ id ຂອງໄຟລ໌).
 *   - script ນີ້ລັນດ້ວຍບັນຊີຂອງທ່ານ → ການອ່ານໄຟລ໌ຖືກຈຳກັດໃຫ້ຢູ່ໃນໂຟເດີຂອງແອັບເທົ່ານັ້ນ.
 */

var SHEET_NAME = 'STATE';   // ເກັບ JSON state ໃນ cell A1
var LOG_NAME   = 'LOG';     // ບັນທຶກປະຫວັດການ save (timestamp)
var FOLDER_NAME = 'ProcurementDemo-Files';  // ໂຟເດີໃນ Drive ສຳລັບໄຟລ໌ແນບ
var ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
var MAX_UPLOAD_BYTES = 6 * 1024 * 1024;     // 6MB ຕໍ່ໄຟລ໌ (ຫຼັງ decode)

function _stateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.getRange('A1').setValue(''); }
  return sh;
}
function _logSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LOG_NAME);
  if (!sh) { sh = ss.insertSheet(LOG_NAME); sh.appendRow(['ເວລາ', 'ຂະໜາດ (bytes)', 'ປະເພດ']); }
  return sh;
}
// ໂຟເດີຂອງແອັບ — ຈື່ id ໄວ້ໃນ Script Properties (ຊື່ຊ້ຳກັນກໍບໍ່ສັບສົນ)
function _appFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('APP_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var folder = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('APP_FOLDER_ID', folder.getId());
  return folder;
}
function _json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
// ໄຟລ໌ນີ້ຢູ່ໃນໂຟເດີຂອງແອັບບໍ (ກັນການອ່ານໄຟລ໌ອື່ນໃນ Drive ຂອງເຈົ້າຂອງ script)
function _inAppFolder_(file) {
  var folderId = _appFolder_().getId();
  var parents = file.getParents();
  while (parents.hasNext()) { if (parents.next().getId() === folderId) return true; }
  return false;
}

// GET          → ຄືນ JSON state ຫຼ້າສຸດ (ຫຼື {} ຖ້າຍັງບໍ່ມີ)
// GET ?file=ID → ຄືນໄຟລ໌ແນບ { ok, name, mime, data(base64) } — ສະເພາະໄຟລ໌ໃນໂຟເດີຂອງແອັບ
function doGet(e) {
  var fileId = e && e.parameter && e.parameter.file;
  if (fileId) {
    try {
      var file = DriveApp.getFileById(String(fileId));
      if (!_inAppFolder_(file)) return _json_({ ok: false, error: 'not found' });
      var blob = file.getBlob();
      return _json_({ ok: true, name: file.getName(), mime: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) });
    } catch (err) {
      return _json_({ ok: false, error: 'not found' });
    }
  }
  var raw = _stateSheet_().getRange('A1').getValue();
  var out = (raw && String(raw).length) ? String(raw) : '{}';
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

// POST { __action: 'upload', name, mime, data(base64) } → ເກັບໄຟລ໌ໃນ Drive, ຄືນ { ok, id }
// POST (state JSON ອື່ນໆ)                               → ບັນທຶກ state ທັງກ້ອນ (ຂຽນທັບ)
function doPost(e) {
  var body = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
  var obj;
  try { obj = JSON.parse(body); } catch (err) { return _json_({ ok: false, error: 'invalid JSON' }); }

  if (obj && obj.__action === 'upload') return _upload_(obj);

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // ກັນຂຽນຊ້ອນກັນ
    _stateSheet_().getRange('A1').setValue(body);
    _logSheet_().appendRow([new Date(), body.length, 'state']);
    return _json_({ ok: true, saved: body.length });
  } catch (err) {
    return _json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function _upload_(obj) {
  try {
    var mime = String(obj.mime || '').toLowerCase();
    if (ALLOWED_MIME.indexOf(mime) < 0) return _json_({ ok: false, error: 'file type not allowed' });
    var bytes = Utilities.base64Decode(String(obj.data || ''));
    if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) return _json_({ ok: false, error: 'file too large or empty' });
    var name = String(obj.name || 'file').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
    var file = _appFolder_().createFile(Utilities.newBlob(bytes, mime, name));
    _logSheet_().appendRow([new Date(), bytes.length, 'file ' + file.getId()]);
    return _json_({ ok: true, id: file.getId() });
  } catch (err) {
    return _json_({ ok: false, error: String(err) });
  }
}
