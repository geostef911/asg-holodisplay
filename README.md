# HALO Studio · ASG THUNDERBOLT SRL

Website în limba română, responsive, realizat pentru ASG THUNDERBOLT SRL. Conținutul comercial a fost reevaluat pe baza contractului de închiriere HOLODISPLAY și a clarificărilor utilizatorului: închiriere 200 EUR + TVA/lună pentru minimum 12 luni; vânzare 2.500 lei + TVA, cu livrabile de confirmat separat. HALO Studio este un brand provizoriu. Nu a fost publicat pe internet.

## Pornire

Necesită Node.js 20 sau mai nou. Din acest director:

```
node server.mjs
```

Deschide http://127.0.0.1:4173. Pentru verificări: `node --test test.mjs`. Nu există dependențe de instalat. Serverul ascultă exclusiv pe calculatorul local.

## Formular și confirmare

Formularul trimite datele către server și confirmă înregistrarea numai după salvarea cu succes. Solicitările se salvează separat în `private-data/`, cu referință, data înregistrării și versiunea informării acceptate. Acest director nu este servit prin web. Nu se trimit emailuri. Previzualizarea cere date fictive; șterge solicitările de test înainte de utilizare comercială. Directorul este exclus din Git, dar trebuie exclus separat și din orice arhivă destinată publicării.

Sunt incluse validare în browser și pe server, limite de lungime, limitarea solicitărilor, verificarea originii, capcană pentru boți, antete de securitate și mesaje de eroare. Acestea sunt pentru previzualizare; infrastructura de producție trebuie configurată separat.

## Editare

`site-config.json` controlează brandul, datele firmei, opțiunile comerciale și catalogul. Repornește serverul după modificări. Nu sunt inventate prețuri, produse, specificații sau contacte.

- `brand`: numele afișat pe site.
- `contact`: companie, email, telefon și adresă confirmate.
- `packages`: denumiri, descrieri, livrabile, etichete de preț și mențiuni editabile. Sunt distincte închirierea, vânzarea și animațiile suplimentare. Dacă modifici tarifele sau contractul, actualizează și rezumatul condițiilor, FAQ-ul și metadatele din `public/index.html`.
- `products`: gol până la confirmarea catalogului. Pentru fiecare produs: `id` unic, `name`, `description`, `specifications` (listă opțională). Adaugă numai specificații verificate.
- Media aprobate: pune fișierul în `public/assets/`, setează `media` la `/assets/nume-fisier.ext`, `mediaType` la `image` sau `video`, și `mediaRightsConfirmed` la `true` doar după verificarea drepturilor. Sunt acceptate PNG, JPG, WebP, SVG, MP4 și WebM. Pentru videoclipuri, preferă fișiere mici, potrivite pentru web.
- `privacy`: operator, contact pentru drepturi, termen de păstrare, temei și versiunea informării. Textul prezent este pentru test, nu o politică finală de producție.
- `internal.saleOffer`: 2.500 lei + TVA, varianta de vânzare clarificată de utilizator. Conținutul ofertei rămâne de confirmat. `internal.rentalSource` păstrează datele din contract pentru trasabilitate. Secțiunea `internal` nu este trimisă în API-ul public.

Toate ilustrațiile și animația sunt originale, create în cod. Nu sunt folosite fotografii, videoclipuri, fonturi sau trackere externe. Simularea 3D este etichetată explicit și poate fi oprită; preferința pentru mișcare redusă este respectată.

## Înainte de publicare

1. Confirmă brandul, catalogul, disponibilitatea, prețurile, TVA și ce include fiecare ofertă. Confirmă modelul și livrabilele ofertei de vânzare de 2.500 lei + TVA; nu atribui vânzării serviciile incluse în chirie. Pentru închiriere, validează versiunea finală a contractului și oferta pentru instalare/configurare. Nu promite un discount, SLA sau preț preferențial de cumpărare după închiriere.
2. Completează identitatea juridică, adresa și contactele ASG THUNDERBOLT SRL.
3. Înlocuiește informarea de test cu cea finală: scop, temei, destinatari, perioadă de păstrare, eventuale transferuri și canalul pentru drepturi. Decide separat dacă este necesar consimțământul pentru gestionarea solicitărilor; nu condiționa oferta de marketing. Referință: [Principiile GDPR, Comisia Europeană](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en).
4. Configurează găzduire cu HTTPS, stocare durabilă și acces autorizat la solicitări, backup, ștergere și notificări comerciale. Serverul actual este exclusiv local; nu este un backend pentru Cloudflare Workers.
5. Adaugă materiale demo reale numai cu drepturi confirmate și testează-le. Nu atribui performanța simulării unui dispozitiv real.
6. Actualizează textele «previzualizare» și confirmarea formularului după conectarea fluxului real. Testează pe dispozitivele vizate.
7. Publicarea publică se face numai după aprobarea utilizatorului.

## Structură

`public/` conține pagina, stilurile și interacțiunile. `server.mjs` deservește pagina și API-ul de cereri. `test.mjs` verifică validarea, salvarea, limitarea și accesul la date.
