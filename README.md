# README - Projet GL02 A24 - Sujet A : Gestion de salles
## Description 
Destiné aux gestionnaires, aux enseignants, et aux étudiants, ce logiciel en ligne de commande permet de visualiser et d'analyser les taux d’occupation des salles, de consulter leur disponibilité, et de faciliter l’importation d'emplois du temps dans des applications de calendrier personnel via des fichiers iCalendar. Ce logiciel est équipé d'un parser (Cruparser) qui permet de récupérer les données nécéssaires au fonctionnement du logiciel. Pour obtenir un graphique de l'occupation des salles il est nécéssaire d'avoir installé en amont vega et vega-lite.

```
<UE> : 4(ALPHA / DIGIT)
<jour> = "L"/"MA"/ "ME"/ "J"/ "V"/"S"
<jourDebut> = <jour>
<jourFin> = <jour>
<heure> = 8 / 9 / 10 / 11 / 12 / 13 / 14 / 15 / 16 / 17 / 18 / 19
<heureDebut> = <heure>
<heureFin> = <heure>
<salle> = ALPHA 3(ALPHA / DIGIT)
<nom> = 1*(%x41-5A / %x61-7A)
```

## Installation
$ npm install

## Utilisation
```
$ node client.js check <fichier> [-r]
Verifie si <fichier> contient des salles réservées plusieurs fois sur le même créneau
    <fichier>          Le fichier .cru à lire
	  -r, --repertoire   Lire un répertoire de manière récursive au lieu d'un fichier
	  
$ node client.js sallesUE <fichier> <UE> [-r] 
Affiche les salles utilisées par <UE> à partir des données de <repertoire>
    <fichier>          Le fichier .cru à lire
	  <UE>               L'UE dont on veut afficher les salles
	  -r, --repertoire   Lire un répertoire de manière récursive au lieu d'un fichier

$ node client.js capacite <fichier> <salle> [-r]
Affiche la capacité de <salle> à partir des données de <fichier>
    <fichier>          Le fichier .cru à lire
	  <salle>            La salle dont on veut afficher la capacite
	  -r, --repertoire   Lire un répertoire de manière récursive au lieu d'un fichier
         
$ node client.js creneau <fichier> <salle> [-r]
Affiche les créneaux où <salle> est libre à partir des données de <ficher>    
    <fichier>          Le fichier .cru à lire
	  <salle...>         La liste des salles dont on veut afficher les créneaux libres
	  -r, --repertoire   Lire un répertoire de manière récursive au lieu d'un fichier
                    
$ node client.js sallesLibres <fichier> <jour> <heureDebut> <heureFin> [-r]
Affiche les salles libres sur le créneau du <jour> de <heureDebut> à <heureFin> à partir des données de <fichier>
    <fichier>          Le fichier .cru à lire
	  <jour>             Le jour du créneau, L, MA, ME, J, V ou S
	  <heureDebut>       L'heure de début du créneau, au format hh:mm
	  <heureFin>         L'heure de fin du créneau, au format hh:mm
	  -r, --repertoire   Lire un répertoire de manière récursive au lieu d'un fichier
    
$ node client.js graphique <fichier> 
Affiche un graphique du nombre de salles occupées en fonction du créneau à partir des données de <repertoire>
    <fichier>          Le fichier .cru à lire
	  -r, --repertoire   Lire un répertoire de manière récursive au lieu d'un fichier
            
$ node client.js classer <fichier> 
Affiche un tableau avec la capacité maximale d'accueil des salles et le nombre de salles, par ordre croissant de capacité d'accueil à partir des données de <afficher>       
    <fichier>          Le fichier .cru à lire
    -d, --decroissant  Ranger par ordre décroissant
	  -r, --repertoire   Lire un répertoire de manière récursive au lieu d'un fichier

$ node client.js enregistrer <nomFichier> <texte>
Enregistre le <texte> dans un fichier <nomFichier>.txt
	<nomFichier>       Le nom du fichier .txt à créer
	<texte>            Le texte à enregistrer

```
> [!WARNING]
> La fonction calendrier n'a pas été implémentée entièrment. Elle fournit des fichiers iCalendar invalides, et ne contenant aucun événement.
```                    
$ node client.js calendrier <fichier> 
Créer un fichier iCalendar avec le nom <nom>.cru, allant de <jourDebut> à <jourFin>, contenant les événements des <UE> à partir des données de <fichier>
	  <fichier>         Le fichier .cru à lire
	  <jourDebut>       Le jour où doit débuter le calendrier
	  <jourFin>         Le jour où doit finir le calendrier
	  <nom>             Le nom de l'utilisateur
	  <UE...>           La liste des UE à ajouter au calendrier
	  -r, --repertoire  Lire un répertoire de manière récursive au lieu d'un fichier
 ```
  
## Implémentation des spécifications
- SPEC 7 : Non implémentée car trop élaborée.
- SPEC 6 : l'utilisateur doit fournir son nom et les UE auxquelles il participe car ces informations ne sont autrement pas fournies.


## Implémentation des objets
- Objet CRNO
  - À la création de l'objet, on doit fournir l'UE, le jour, l'horaire de début, l'horaire de fin, la salle et la capacité


## Version
Version 1.0

## Liste des contributeurs et contributrices
DEUMENI Cécile-Audrée (cecile-audree.deumeni_ngaleu@utt.fr)
PEREIRA Lucile (lucile.pereira@utt.fr)
GUYOT Pauline (pauline.guyot@utt.fr)

## Licences
Aucune