const fs = require('fs');
const parser = require('./CruParser.js');

//moi
const path = require('path');
const ical = require('ical-generator').default
const {parseCruData, generateICal, getSallesByUE, checkForConflicts} = require('./fonction_check.js')

//
const vg = require('vega');
const vegalite = require('vega-lite');
const cli = require("@caporal/core").default;

//moi
function readCruFile(filepath) { return fs.readFileSync(filepath, 'utf-8'); }
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



cli
	.version('-parser-cli')
	.version('0.01')
	
	// check CRU
	.command('check', 'Verifier si <repertoire> contient des salles réservées plusieurs fois sur le même créneau')
	.argument('<repertoire>', 'Le répertoire à vérifier')
	.action((args,logger) => { 
		console.log(args)
		console.log(args.args.repertoire)
		// Correction ici pour passer les arguments correctement 
		console.log(`Vérification des conflits dans le répertoire: ${args.args.repertoire}`); 
		/*const cruFiles = fs.readdirSync(args.args.repertoire) 
			.filter(file => path.extname(file) === '.cru') 
			.map(file => readCruFile(path.join(args.args.repertoire, file))); 
		console.log(`Fichiers lus: ${cruFiles.length}`); */
		const conflicts = checkForConflicts(args.args.repertoire); 
		if (conflicts.length === 0) { 
			console.log('Aucun conflit de réservation de salle trouvé.'); 
		} 
		else { 
			console.log('Conflits trouvés:'); 
			conflicts.forEach(conflict => console.log(conflict)); 
		} 
	})

	// salles d'une UE
	.command('sallesUE', 'Afficher les salles utilisées par <UE> à partir des données de <repertoire>')
	.argument('<UE>', "L'UE dont on veut afficher les salles")
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({ args, logger }) => { 
		console.log(args);
		const cruFiles = fs.readdirSync(args.repertoire) 
        .filter(file => path.extname(file) === '.cru') 
        .map(file => readCruFile(path.join(args.repertoire, file))); 
		 
		const salles = getSallesByUE(args.ue,cruFiles); 
		console.log(salles)
		if (salles.length === 0) { 
			logger.info(`Aucune salle trouvée pour l'UE ${args.ue}.`); 
		} 
		else { 
			logger.info(`Salles utilisées pour l'UE ${args.ue}: ${salles.join(', ')}`); 
		} 
	})

	// capacite d'une salle 
	.command('capacite', 'Afficher la capicité de <salle> à partir des données de <repertoire>')
	.argument('<salle>', 'La salle dont on veut afficher la capacite')
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, options, logger}) => {	
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
	.argument('<UE>', "Les UEs à ajouter au calendrier") 
	.argument('<repertoire>', 'Le répertoire à utiliser')
	
	.action(({ args, logger }) => { 
		console.log(args); 
		const cruFiles = fs.readdirSync(args.repertoire) 
			.filter(file => path.extname(file) === '.cru') 
			.map(file => readCruFile(path.join(args.repertoire, file)));
		//console.log(cruFiles);
		 // Afficher les données parsées 
		const courses = cruFiles.flatMap(parseCruData); 
		console.log("Cours parsés:", courses); 
		// Filtrer les cours par UE
		console.log("UE spécifiée:", args.ue);
		const filteredCourses = courses.filter(course => course.ue === args.ue); 
		console.log("Cours filtrés par UE:", filteredCourses);
		 // Générer le fichier iCalendar 
		generateICal(filteredCourses, `${args.nom}.ics`); 
		logger.info(`Fichier iCalendar généré pour ${args.nom}`);
	})

	// classer les salles 
	.command('classer', "Afficher un tableau avec la capacité maximale d'accueil des salles et lenombre de salles par capacité d'accueil à partir des données de <repertoire>")
	.argument('<repertoire>', 'Le répertoire à utiliser')
	.action(({args, logger}) => {	
	   // À IMPLÉMENTER
	})	
	
cli.run(process.argv.slice(2));
	