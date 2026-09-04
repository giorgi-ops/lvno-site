# lvno-site

Site vitrine one-page de **LVNO** — executive assistance haut de gamme.
Cible : https://lvno.fr

## Stack

HTML, CSS et JavaScript natif. Aucun framework, aucune étape de build.
Hébergement prévu : GitHub Pages (branche `main`, racine du dépôt).

## Structure

```
index.html                 page anglaise (défaut, à la racine)
fr/index.html              page française
legal-notice.html          legal notice EN
fr/mentions-legales.html   mentions légales FR
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

## Bilinguisme — anglais par défaut

Deux pages statiques : **l'anglais à la racine**, le français sous `/fr/`.
`hreflang` réciproques, et `x-default` pointant sur l'anglais.

**Il n'y a aucune détection de la langue du navigateur**, nulle part. La racine
sert l'anglais à tout le monde, y compris à un visiteur dont le navigateur est
en français. C'est un choix explicite, pas un oubli : ne pas réintroduire de
lecture de `navigator.language` ni de `Accept-Language`.

Le choix du visiteur est mémorisé pour la durée de sa session :

- un clic sur le sélecteur enregistre `sessionStorage['lvno-lang']`
  (`assets/js/site.js`, via les attributs `data-lang`) ;
- les pages **anglaises** portent un court script en ligne dans le `<head>`
  qui redirige vers l'équivalent français si — et seulement si — cette valeur
  vaut `fr`. Les pages françaises n'ont aucun script de ce genre, donc aucune
  redirection ne ramène jamais vers l'anglais.

Comme l'enregistrement n'a lieu qu'au clic, un robot d'indexation ne stocke
rien et voit toujours l'anglais à la racine.

`site.js` ne contient **aucune chaîne de caractères visible** : tous les
libellés d'interface qu'il manipule — messages du formulaire, libellé du bouton
pendant l'envoi, `aria-label` du menu — sont lus dans le balisage via des
attributs `data-msg-*`, `data-label-open` et `data-label-close`. Le script est
donc partagé sans duplication entre les deux langues.

Les chemins des ressources sont **absolus** (`/assets/…`) pour rester valides
depuis `/fr/`. Conséquence : ouvrir un fichier directement en `file://`
n'affiche aucun style — il faut passer par un serveur local.

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

## Formulaire de contact

Le site est statique : GitHub Pages ne peut pas envoyer d'e-mail. Les deux
formulaires postent donc vers **Formspree** (`https://formspree.io/f/xbgjkgwd`),
en AJAX depuis `assets/js/site.js`.

L'envoi est écrit à la main plutôt que confié à `@formspree/ajax` : la
bibliothèque se charge depuis un CDN externe, ce qui rétablirait la requête
tierce que l'auto-hébergement des polices vient de supprimer, et elle ne saurait
pas lire nos libellés `data-msg-*`. Le code maison couvre déjà l'état d'envoi, la
désactivation du bouton, `aria-invalid` par champ et l'état de succès.

Champs spéciaux envoyés :

| Champ | Rôle |
|---|---|
| `email` | détecté par Formspree comme adresse de réponse |
| `_subject` | objet de l'e-mail reçu, distinct entre FR et EN |
| `_language` | langue de la page de remerciement servie par Formspree aux visiteurs sans JavaScript |
| `_gotcha` | leurre anti-spam, masqué en CSS |

**Formspree renvoie ses erreurs de validation en anglais**, quel que soit
`_language`. Le script affiche donc toujours son propre message localisé
(`data-msg-error`) et réserve le détail technique du serveur à la console, tout
en marquant `aria-invalid` sur les champs que le serveur a refusés.

Réponse observée en cas de succès : `{"next":"…","ok":true}` en HTTP 200.
En cas d'échec : HTTP 422 et `{"error":"…","errors":[{"code","field","message"}]}`.

## À renseigner avant mise en ligne

Rien pour le contenu. Il reste à créer le dépôt, pousser et activer GitHub Pages
avec le domaine `lvno.fr` (voir `CNAME`).

## Développement local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```
