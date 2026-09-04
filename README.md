# lvno-site

Site vitrine one-page de **LVNO** — executive assistance haut de gamme.
Cible : https://lvno.fr

## Stack

HTML, CSS et JavaScript natif. Aucun framework, aucune étape de build.
Hébergement prévu : GitHub Pages (branche `main`, racine du dépôt).

## Structure

```
index.html                 page française (défaut)
en/index.html              page anglaise
mentions-legales.html      mentions légales FR
en/legal-notice.html       legal notice EN
404.html                   page d'erreur, bilingue
CNAME                      domaine personnalisé GitHub Pages (lvno.fr)
.nojekyll                  désactive le traitement Jekyll
robots.txt sitemap.xml     indexation, avec alternates hreflang
assets/css/base.css        jetons de charte, reset, sigle, animations
assets/css/style.css       habillage du site (thème sombre)
assets/js/site.js          menu, apparitions, compteurs, envoi du formulaire
assets/img/logo.png        logo recadré (512 px)
assets/img/logo-mask.png   même forme en masque alpha
assets/img/favicon.png     favicon 180 px, logo vert sur fond encre
assets/img/giorgi.jpg      portrait de la section À propos
```

Sections de la page : hero → repères chiffrés → services → méthode → à propos → contact.

La baseline « Your high-level executive support » reste **en anglais dans les deux
versions** : c'est la signature de marque, elle ne se traduit pas. Dans la page
française, le `<h1>` porte donc un `lang="en"` pour que les lecteurs d'écran
l'énoncent correctement.

## Bilinguisme

Deux pages statiques, français par défaut à la racine et anglais sous `/en/`,
reliées par un sélecteur FR / EN dans l'en-tête et par des `hreflang`
réciproques (plus un `x-default` sur le français).

`site.js` ne contient **aucune chaîne de caractères visible** : tous les libellés
d'interface qu'il manipule — messages du formulaire, libellé du bouton pendant
l'envoi, `aria-label` du menu — sont lus dans le balisage via des attributs
`data-msg-*`, `data-label-open` et `data-label-close`. Le script est donc partagé
sans duplication entre les deux langues.

Les chemins des ressources sont **absolus** (`/assets/…`) pour rester valides
depuis `/en/`. Conséquence : ouvrir un fichier directement en `file://` n'affiche
aucun style — il faut passer par un serveur local (voir plus bas).

## Polices

Space Grotesk et Inter Tight sont **auto-hébergées** dans `assets/fonts/`
(licence OFL 1.1, auto-hébergement autorisé). Aucune requête vers Google : les
`@font-face` sont déclarés en tête de `assets/css/base.css`, et les deux fichiers
`latin` sont préchargés depuis le `<head>` de chaque page.

Google sert ces deux familles sous forme de **polices variables** : un seul
fichier couvre les graisses 300 à 500, il n'y a donc qu'un fichier par famille et
par sous-ensemble. Les `unicode-range` sont conservés, si bien que `latin-ext`
n'est jamais téléchargé avec le contenu actuel — 65,7 Ko de polices par page,
171,9 Ko dans le dépôt.

## Charte

La palette est **dérivée du logo** (`assets/img/logo.png`), dont la couleur exacte
est `#62B1A1` — hsl(168 34 % 54 %), un vert teal. Tous les jetons sont déclarés
dans `:root` en tête de `assets/css/base.css`.

Deux contraintes de contraste, mesurées, structurent la charte :

- **du blanc sur `#62B1A1` ne passe pas** (2,52:1) — les boutons pleins en vert
  logo portent donc du texte encre (`--on-brand`, 6,79:1) ;
- pour du **petit texte vert sur fond clair**, il faut descendre à `#2A6156`
  (`--accent-txt`, 6,75:1) ; `#3A8172` plafonne à 4,35:1.

### Le sigle

`assets/img/logo-mask.png` est utilisé comme **masque alpha** (`.mark` dans
`base.css`) : la forme prend `currentColor` et suit donc la couleur de son
contexte, sans dupliquer le fichier. Une garde `@supports` masque l'élément si
le navigateur ne gère pas les masques, plutôt que d'afficher un aplat.

## À renseigner avant mise en ligne

1. **Formspree** — remplacer `REMPLACER_PAR_VOTRE_ID` dans l'attribut `action`
   du `<form>`, **dans les deux pages** (`index.html` et `en/index.html`) :

   ```html
   <form ... action="https://formspree.io/f/xxxxxxxx" method="POST">
   ```

   Tant que ce n'est pas fait, le formulaire affiche un message d'erreur
   explicite plutôt que de perdre silencieusement les messages.

2. **Mentions légales** — l'adresse et le SIRET sont des marqueurs
   `[à compléter]`, signalés visuellement en orange sur les deux pages légales.

3. **Adresse e-mail** — `contact@lvno.fr` est utilisée partout, à confirmer.

## Développement local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```
