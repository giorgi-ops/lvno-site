# lvno-site

Site vitrine one-page de **LVNO** — executive assistance haut de gamme.
Cible : https://lvno.fr

## Stack

HTML, CSS et JavaScript natif. Aucun framework, aucune étape de build.
Hébergement prévu : GitHub Pages (branche `main`, racine du dépôt).

## État : trois directions au choix

`index.html` est pour l'instant une **page de comparaison interne** (`noindex`) qui
présente les trois partis pris graphiques. La direction retenue deviendra `index.html`
et les deux autres seront supprimées avant la mise en ligne.

| Fichier | Direction | Parti pris |
|---|---|---|
| `option-a.html` | Éditorial | Papier clair, titrage serif surdimensionné, filets fins, services en lignes de magazine |
| `option-b.html` | Nuit / verre | Fond encre, halos dégradés, cartes en verre dépoli, halo au curseur |
| `option-c.html` | Bento affirmé | Grotesque gras, aplats de couleur, grille bento asymétrique, compteurs animés |

## Charte

La palette est **dérivée du logo** (`assets/img/logo.png`), dont la couleur exacte
est `#62B1A1` — hsl(168 34 % 54 %), un vert teal. Tous les jetons sont déclarés
dans `:root` en tête de `assets/css/base.css`.

Deux contraintes de contraste, mesurées, structurent la charte :

- **du blanc sur `#62B1A1` ne passe pas** (2,52:1) — les boutons pleins en vert
  logo portent donc du texte encre (`--on-brand`, 6,79:1) ;
- pour du **petit texte vert sur fond clair**, il faut descendre à `#2A6156`
  (`--accent-txt`, 6,75:1) ; `#3A8172` plafonne à 4,35:1.

## Structure

```
index.html              page de comparaison (temporaire)
option-a|b|c.html       les trois directions
404.html                page d'erreur
CNAME                   domaine personnalisé GitHub Pages (lvno.fr)
.nojekyll               désactive le traitement Jekyll
robots.txt sitemap.xml  indexation
assets/css/base.css     jetons de charte, reset, sigle, animations — commun aux trois
assets/css/a|b|c.css    une feuille par direction
assets/js/site.js       menu, apparitions, compteurs, envoi du formulaire — commun
assets/img/logo.png     logo recadré (512 px)
assets/img/logo-mask.png  même forme en masque alpha
assets/img/favicon.png  favicon 180 px, logo vert sur fond encre
```

### Le sigle

`assets/img/logo-mask.png` est utilisé comme **masque alpha** (`.mark` dans
`base.css`) : la forme prend `currentColor` et suit donc la couleur de son
contexte — vert sur fond clair, blanc ou encre ailleurs, sans dupliquer le
fichier. Une garde `@supports` masque l'élément si le navigateur ne gère pas
les masques, plutôt que d'afficher un aplat.

## Configuration à faire

1. **Formspree** — remplacer `REMPLACER_PAR_VOTRE_ID` par l'identifiant du
   formulaire dans l'attribut `action` du `<form>`, dans le fichier de la
   direction retenue :

   ```html
   <form ... action="https://formspree.io/f/xxxxxxxx" method="POST">
   ```

   Tant que ce n'est pas fait, le formulaire affiche un message d'erreur
   explicite plutôt que de perdre silencieusement les messages.

2. **Adresse e-mail** — `contact@lvno.fr` apparaît dans les trois pages et dans
   `assets/js/site.js`.

3. **Textes** — les sections « Méthode » et les libellés de contact
   (réponse sous 24 h ouvrées, zone d'intervention, langues) sont une copie de
   départ à relire.

## Développement local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```
