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
