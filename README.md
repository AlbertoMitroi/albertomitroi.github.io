# Alberto Mitroi / Portfolio

Portofoliu static pentru GitHub Pages, cu un CV PDF generat separat în Python.

## Structura

- `data.js`: prezentarea, experiența, proiectele, competențele, certificările și educația.
- `index.html`: structura paginii, titlurile secțiunilor, metadatele sociale și datele structurate Person.
- `app.js`: afișarea datelor, navigarea, galeriile și butoanele de descărcare.
- `styles.css`: aspectul și layout-ul responsive.
- `scripts/generate_ats_cv.py`: conținutul și generatorul CV-ului ATS.
- `assets/CV_AlbertoMitroi.pdf`: CV-ul descărcat de vizitatori.

## Actualizarea conținutului

Păstrează textele și datele din `data.js` în acord cu CV-ul din `scripts/generate_ats_cv.py`. Portofoliul poate include galerii și cursuri suplimentare, cu proiectele și prototipurile identificate explicit.

Actualizează și textele statice din `index.html`: titlul paginii, descrierea, Open Graph, Twitter, JSON-LD și titlurile secțiunilor. După modificări, actualizează versiunile pentru `data.js` și `app.js` din HTML și versiunea linkului PDF din `app.js`, pentru a evita folosirea conținutului vechi din cache.

## Generarea CV-ului

Necesită Python 3 și `reportlab`:

```sh
python3 scripts/generate_ats_cv.py
```

Generatorul scrie PDF-ul în `assets/CV_AlbertoMitroi.pdf` și versiuni Markdown/plain text alături. Pentru un director de verificare separat:

```sh
python3 scripts/generate_ats_cv.py --output output/pdf/CV_AlbertoMitroi.pdf
```

Verifică PDF-ul înainte de a-l copia în `assets/`. Butoanele de descărcare folosesc PDF-ul static; nu îl generează cu `html2pdf.js`. `app.js` păstrează și un markup HTML separat pentru imprimare.

## Verificare locală

```sh
python3 -m http.server 3000 --bind 127.0.0.1
node --check data.js
node --check app.js
```

Deschide `http://127.0.0.1:3000`, verifică pagina pe desktop și mobil, navigarea, galeriile și descărcarea CV-ului.

## Publicare

GitHub Pages servește fișierele statice din branch-ul și directorul configurate în Settings → Pages. Modificările locale devin publice după commit/push și publicarea GitHub Pages.
