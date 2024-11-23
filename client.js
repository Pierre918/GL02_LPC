const fs = require('fs');
const colors = require('colors');
const parser = require('./VpfParser.js');

const vg = require('vega');
const vegalite = require('vega-lite');

const cli = require("@caporal/core").default;

cli
	.version('-parser-cli')
	.version('0.01')
	
	// check CRU
	.command('check', 'Verifier si <repertoire> contient des salles réservées plusieurs fois sur le même créneau')
	.argument('<repertoire>', 'Le répertoire à vérifier')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	    
	    // Pour récupérer les fichiers .cru
	    fs.readdir(__dirname, { recursive: true }, (err, files) => {
            if (err)
                console.log(err);
            else {
                files.forEach(file => {
                    if (path.extname(file) == ".cru"){
                        
                    }
                })
            }
        })	
	})

	// salles d'une UE
	.command('sallesUE', 'Afficher les salles utilisées par <UE> à partir des données de <repertoire>')
	.argument('<UE>', "L'UE dont on veut afficher les salles")
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	})	

	// capacite d'une salle 
	.command('capacite', 'Afficher la capicité de <salle> à partir des données de <repertoire>')
	.argument('<salle>', 'La salle dont on veut afficher la capacite')
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	})	

	// creneaux libres d'une ou plusieurs salle(s)
	.command('creneau', 'Afficher les créneaux où <salle> est libre à partir des données de <repertoire>')
	.argument('<salle...>', 'La ou les salle(s) dont on veut afficher les créneaux libres')
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	})	

	// salles libres 
	.command('sallesLibres', 'Afficher les salles libres sur le créneau du <jour> de <heureDebut> à <heureFin> à partir des données de <repertoire>')
	.argument('<jour>', 'Le jour du créneau')
	.argument('<heureDebut>', "L'heure de début du créneau")
	.argument('<heureFin>', "L'heure de fin du créneau")
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	})	

	// graphique de l'occupation des salles
	.command('graphique', 'Afficher un graphique du nombre de salles occupées en fonction du créneau à partir des données de <repertoire>')
	.option('-j --jour', 'afficher le nombre de salles occupées en fonction du jour de la semaine', { validator : cli.BOOLEAN, default: false })
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, options, logger}) => {	
	   // À IMPLÉMENTER
	})	

	// fichier iCalendar
	// https://icalendar.org/validator.html <= testeur de fichier icalendar
	.command('calendrier', 'Afficher les salles utilisées par <UE> à partir des données de <repertoire>')
	.argument('<jourDebut>', 'Le jour où doit débuter le calendrier')
	.argument('<jourFin>', 'Le jour où doit finir le calendrier')
	.argument('<nom>', "Le nom de l'utilisateur")
	.argument('<UE...>', "Les UEs à ajouter au calendrier")
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	})	

	// classer les salles 
	.command('classer', "Afficher un tableau avec la capacité maximale d'accueil des salles et lenombre de salles par capacité d'accueil à partir des données de <repertoire>")
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	})	
	
cli.run(process.argv.slice(2));
	