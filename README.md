# Alberto CV / Portfolio — GitHub Pages Ready

Acest proiect este gândit să meargă direct pe **GitHub Pages** și folosește un **single source of truth**:

- `data.js` = singurul fișier pe care îl modifici
- `index.html` = structura paginii
- `styles.css` = design-ul
- `app.js` = randarea site-ului + generarea CV-ului PDF din aceleași date

## Cum funcționează

1. Site-ul citește obiectul `window.cvData` din `data.js`
2. Pagina publică este populată din acest obiect
3. CV-ul pentru PDF este generat din același obiect
4. Butonul **Download PDF** încearcă să exporte PDF cu `html2pdf.js`
5. Dacă exportul nu merge, fallback-ul este `window.print()`

## Ce trebuie să editezi

Editează doar:

- `data.js`

Acolo ai:
- date personale
- summary
- experiență
- proiecte
- skills
- certificări
- educație
- linkuri

## Deploy pe GitHub Pages

### Varianta simplă
1. Creezi un repo nou pe GitHub
2. Uploadezi toate fișierele din acest folder în repo
3. În GitHub mergi la **Settings → Pages**
4. La **Build and deployment** alegi:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / root
5. Salvezi și aștepți publicarea

### Structura proiectului
```text
index.html
styles.css
app.js
data.js
assets/
  profile.jpg
```

## Important

- `assets/profile.jpg` este extras din screenshot-ul CV-ului și este low-res.
- Pentru un rezultat mai bun, înlocuiește imaginea cu una mai clară, păstrând același nume de fișier.
- În `data.js`, certificarea **AZ-204** a fost lăsată exact cum apare în CV-ul trimis (`In Progress`).
  Dacă vrei varianta actualizată, schimbă acel text direct din `data.js`.

## Testare locală

Poți deschide direct `index.html` în browser.

## Recomandare

După ce actualizezi datele:
- împinge modificările în GitHub
- deschide site-ul publicat
- apasă **Download PDF**
- verifică rezultatul final
