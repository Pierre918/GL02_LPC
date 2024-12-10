# RE# README - Projet GL02 A24 - Sujet A : Gestion de salles
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
$ node client.js check <repertoire>   
  Verifie si <repertoire> contient des salles réservées plusieurs fois sur le même créneau	
    <repertoire>
      Le répertoire à utiliser			  
$ node client.js sallesUE <repertoire> <UE>  
  Affiche les salles utilisées par <UE> à partir des données de <repertoire>
    <repertoire>
      Le répertoire à utiliser
    <UE>
      L'UE dont on veut afficher les salles
$ node client.js capacite <repertoire> <salle>  
  Affiche la capacité de <salle> à partir des données de <repertoire>
    <repertoire>
      Le répertoire à utiliser
    <salle>  
      La salle dont on veut afficher la capacite
         
$ node client.js creneau <repertoire> <salle>  
  Affiche les créneaux où <salle> est libre à partir des données de <repertoire>    
    <repertoire>
      Le répertoire à utiliser
    <salle>  
      La ou les salle(s) dont on veut afficher les créneaux libres                        
$ node client.js sallesLibres <repertoire> <jour> <heureDebut> <heureFin> 
  Affiche les salles libres sur le créneau du <jour> de <heureDebut> à <heureFin> à partir des données de <repertoire>
    <repertoire>
      Le répertoire à utiliser 
    <jour>  
      Le jour du créneau, L, MA, ME, J, V ou S
    <heureDebut>
      L'heure de début du créneau, au format hh:mm
    <heureFin> 
      L'heure de fin du créneau, au format hh:mm
$ node client.js graphique <repertoire> 
  Affiche un graphique du nombre de salles occupées en fonction du créneau à partir des données de <repertoire>
    <repertoire>
      Le répertoire à utiliser
            
$ node client.js classer <repertoire> 
  Affiche un tableau avec la capacité maximale d'accueil des salles et le nombre de salles par capacité d'accueil à partir des données de <repertoire>       
    <repertoire>
      Le répertoire à utiliser
                          
$ node client.js calendrier <repertoire> 
  Affiche les salles utilisées par <UE> à partir des données de <repertoire>
    <repertoire>
      Le répertoire à utiliser
    <jourDebut> 
      Le jour où doit débuter le calendrier
    <jourFin>
      Le jour où doit finir le calendrier
    <nom>
      Le nom de l'utilisateur")
    <UE>
      Les UEs à ajouter au calendrier") 
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
