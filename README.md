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

ຫຼັງຕັ້ງແລ້ວ: ທຸກການສ້າງ/ອະນຸມັດ PR ຈະ save ຂຶ້ນ Sheet ອັດຕະໂນມັດ ແລະ ເຄື່ອງອື່ນ (ຕັ້ງ URL ດຽວກັນ) ຈະເຫັນຂໍ້ມູນຊຸດດຽວກັນ.

> 🔒 **ຄວາມປອດໄພ:** URL ຂອງ GAS **ບໍ່ຖືກຝັງໃນ source** — ເກັບໃນ browser (localStorage) ຂອງແຕ່ລະຄົນ. ຢ່າ commit URL ນີ້ຂຶ້ນ repo ສາທາລະນะ.

---

## 3) ແລ່ນທ້ອງຖິ່ນ (ທົດສอบກ່ອນ deploy)

```bash
cd "procurement-mockup"
python -m http.server 8791
```

ເປີດ `http://localhost:8791/index.html` (ຢ່າ double-click ໄຟລ໌ file:// — support.js ຈະບໍ່ແລ່ນ).

---

## ຂໍ້ຈຳກັດ / ຄວນຮູ້
- 1 cell ຂອງ Sheet ເກັບ ~50,000 ຕົວອັກສອນ — demo ພຽງພໍ; ຫຼີກລ່ຽງອັບໄຟລ໌ແນບຂະໜາດໃຫຍ່ໃນໂໝດ sync.
- ໂໝດ sync ນີ້ຂຽນທັບຂໍ້ມູນທັງກ້ອນ (last-write-wins) — ເໝາະສຳລັບທີມນ້ອຍ/demo. ລະບົບຈິງຄວນເກັບແຍກຕໍ່ເອກະສານ.
- ລະຫັດ `1234` + ຊື່ຄົນ = ຕົວຢ່າງ. ລະບົບຈິງຕ້ອງໃຊ້ auth ຈິງ (ເບິ່ງ schema Postgres/NestJS ໃນຊຸດເດີມ).
- ໂລໂກ້ໃນ `uploads/` ຄວນປ່ຽນເປັນໂລໂກ້ກາງ/ຕົວຢ່າງ ຖ້າ publish ສາທາລະນะ.
