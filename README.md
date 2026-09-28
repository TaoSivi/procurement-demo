# ລະບົບຈັດຊື້ຈັດຈ້າງ (ຕົວຢ່າງ / DEMO)

ເວັບແອັບຕົວຢ່າງ (single-page, offline-first) — PR → ອະນຸມັດຕາມລຳດັບຄົນທີ່ເລືອກ → ໃບສະເໜີລາຄາ → PO → ຮັບເຄື່ອງ (GRN).
Frontend: HTML + `support.js` (client-side, ບໍ່ຕ້ອງ build).
Backend (ທາງເລືອກ): Google Apps Script + Google Sheets — ເກັບຂໍ້ມູນແຊร์ຂ້າມເຄື່ອງ.

> ⚠️ ຂໍ້ມູນຄົນ/ບໍລິສັດໃນນີ້ແມ່ນ **ຕົວຢ່າງສົມມຸດ** ທັງໝົດ. ລະຫັດຜ່ານສາທິດ = `1234`.

---

## 1) ເອົາຂຶ້ນ GitHub Pages

ຕ້ອງມີ: [git](https://git-scm.com/) ແລະ [GitHub CLI (`gh`)](https://cli.github.com/) (ຫຼືສ້າງ repo ຜ່ານເວັບກໍໄດ້).

```bash
cd "procurement-mockup"
git init
git add .
git commit -m "Procurement demo app"
gh auth login          # ຄັ້ງທຳອິດເທົ່ານັ້ນ (ຖ້າຍັງບໍ່ login)
gh repo create procurement-demo --public --source=. --push
```

ຈາກນັ້ນເປີດໃຊ້ Pages:

```bash
gh api -X POST repos/{owner}/procurement-demo/pages -f "source[branch]=main" -f "source[path]=/"
```

(ຫຼືທາง UI: repo → **Settings → Pages → Source: main / (root) → Save**)

URL ຈະເປັນ: `https://<your-username>.github.io/procurement-demo/`
(ລໍ ~1 ນາທີ ໃຫ້ Pages build ເສັດ.)

---

## 2) ຕໍ່ backend ເກັບຂໍ້ມູນ (Google Sheets)

ເບິ່ງຄຳແນະນຳລະອຽດຢູ່ຫົວໄຟລ໌ [`Code.gs`](Code.gs). ສະຫຼຸບ:

1. ສ້າງ Google Sheet ໃໝ່ → Extensions → Apps Script → paste `Code.gs`.
2. Deploy → New deployment → **Web app** → Execute as **Me**, Access **Anyone** → Deploy → ກັອບ URL (`.../exec`).
3. ເປີດແອັບ → ໜ້າ login → **⚙ ຕັ້ງຄ່າ Google Sheet Sync** → ວາງ URL.

ຫຼັງຕັ້ງແລ້ວ: ທຸກການສ້າງ/ອະນຸມັດ PR ແລະ ເບີກລ່ວງໜ້າ ຈະ save ຂຶ້ນ Sheet ອັດຕະໂນມັດ ແລະ ເຄື່ອງອື່ນ (ຕັ້ງ URL ດຽວກັນ) ຈະເຫັນຂໍ້ມູນຊຸດດຽວກັນ.
ການເຂົ້າສູ່ລະບົບເປັນຂອງແຕ່ລະເຄື່ອງ (ບໍ່ແຊຜ່ານ Sheet).

### ອັບເດດ `Code.gs` (ຈຳເປັນ ສຳລັບຮູບໃບບິນ ເບີກລ່ວງໜ້າ)
ສະບັບໃໝ່ເກັບຮູບໃບບິນໃນ **Google Drive** (ໂຟເດີ `ProcurementDemo-Files`, ໄຟລ໌ເປັນສ່ວນຕົວ — ແອັບດຶງເບິ່ງຜ່ານ script ເທົ່ານັ້ນ).
1. Apps Script → ວາງ `Code.gs` ສະບັບໃໝ່ທັບ → Save.
2. **Deploy → Manage deployments → ✏ ແກ້ deployment ເດີມ → Version: New version → Deploy** (URL ບໍ່ປ່ຽນ).
3. ກົດ **Authorize** ເມື່ອມີໜ້າຂໍສິດ Google Drive.

ຖ້າບໍ່ເປີດ Sync: ຮູບໃບບິນຈະຖືກບີບອັດ ແລະ ເກັບໃນ browser ແທນ (ພໍສຳລັບ demo ເຄື່ອງດຽວ).

> 🔒 **ຄວາມປອດໄພ:** URL ຂອງ GAS **ບໍ່ຖືກຝັງໃນ source** — ເກັບໃນ browser (localStorage) ຂອງແຕ່ລະຄົນ. ຢ່າ commit URL ນີ້ຂຶ້ນ repo ສາທາລະນะ.

---

## 3) ແລ່ນທ້ອງຖິ່ນ (ທົດສอบກ່ອນ deploy)

```bash
cd "procurement-mockup"
python -m http.server 8791
```

ເປີດ `http://localhost:8791/index.html` (ຢ່າ double-click ໄຟລ໌ file:// — support.js ຈະບໍ່ແລ່ນ).

---

## ໂມດູນເບີກລ່ວງໜ້າ (ສະຫຼຸບ)
ຂໍເບີກ → ອະນຸມັດ (ຕາມ Workflow, ຫຼາຍຄົນຕາມລຳດັບ) → ຈ່າຍເງິນ → ຜູ້ເບີກຢືນຢັນຮັບເງິນ → ເຄຍ (ຕິກໝວດ + ຮູບໃບບິນ) → ກວດເຄຍ → ສົ່ງຄືນ / ຈ່າຍເພີ່ມ → ສຳເລັດ.
Admin ຕັ້ງໄດ້ທີ່ ⚙ ການຕັ້ງຄ່າ: Workflow ເບີກລ່ວງໜ້າ (ຄ່າເລີ່ມຕົ້ນ), ໝວດຄ່າໃຊ້ຈ່າຍ, ຈຳນວນວັນເຄຍ, % ໃຊ້ເກີນ, ເພດານຊື້ເຄື່ອງເລັກນ້ອຍດ່ວນ.

## ຂໍ້ຈຳກັດ / ຄວນຮູ້
- 1 cell ຂອງ Sheet ເກັບ ~50,000 ຕົວອັກສອນ — ຮູບໃບບິນເບີກລ່ວງໜ້າໄປ Drive ແລ້ວ, ແຕ່ໄຟລ໌ແນບຂອງ PR/ໃບສະເໜີລາຄາ ຍັງເກັບໃນ state → ຫຼີກລ່ຽງໄຟລ໌ໃຫຍ່ໃນໂໝດ sync.
- ໂໝດ sync ນີ້ຂຽນທັບຂໍ້ມູນທັງກ້ອນ (last-write-wins) — ເໝາະສຳລັບທີມນ້ອຍ/demo. ລະບົບຈິງຄວນເກັບແຍກຕໍ່ເອກະສານ.
- ລະຫັດ `1234` + ຊື່ຄົນ = ຕົວຢ່າງ. ລະບົບຈິງຕ້ອງໃຊ້ auth ຈິງ (ເບິ່ງ schema Postgres/NestJS ໃນຊຸດເດີມ).
- ໂລໂກ້ໃນ `uploads/` ຄວນປ່ຽນເປັນໂລໂກ້ກາງ/ຕົວຢ່າງ ຖ້າ publish ສາທາລະນะ.
