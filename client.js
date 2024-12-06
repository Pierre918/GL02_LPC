const fs = require('fs');
const parser = require('./CruParser.js');

//moi
const path = require('path');
const ical = require('ical-generator').default
const {parseCruData, generateICal, getSallesByUE, checkForConflicts, isValidCruFile} = require('./fonction_check.js')

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
	.version('vpf-parser-cli')
	.version('0.07')

	// check Vpf
	/*.command('check', 'Check if <file> is a valid Vpf file')
	.argument('<file>', 'The file to check with Vpf parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
		
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
	  
			var analyzer = new VpfParser(options.showTokenize, options.showSymbols);
			analyzer.parse(data);
			
			if(analyzer.errorCount === 0){
				logger.info("The .vpf file is a valid vpf file".green);
			}else{
				logger.info("The .vpf file contains error".red);
			}
			
			logger.debug(analyzer.parsedPOI);

		});
			
	})
	
	// readme
	.command('readme', 'Display the README.txt file')
	.action(({args, options, logger}) => {
		fs.readFile("./README.txt", 'utf8', function(err, data){
			if(err){
				return logger.warn(err);
			}
			
			logger.info(data);
		});
		
	})
	
	// search
	.command('search', 'Free text search on POIs\' name')
	
	
	.argument('<file>', 'The Vpf file to search')
	.argument('<needle>', 'The text to look for in POI\'s names')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new VpfParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){
			var n = new RegExp(args.needle);
			var filtered = analyzer.parsedPOI.filter( p => p.name.match(n, 'i'));
			logger.info("%s", JSON.stringify(filtered, null, 2));
			
		}else{
			logger.info("The .vpf file contains error".red);
		}
		
		});
	})

	// average
	.command('average', 'Compute the average note of each POI')
	.alias('avg')
	.argument('<file>', 'The Vpf file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new VpfParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var avg = analyzer.parsedPOI.map(p => {
				var m = 0	
				// compute the average for each POI
				if(p.ratings.length > 0){
					m = p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) / p.ratings.length;
				}
				p["averageRatings"] = m;
				return p;
			})
			logger.info("%s", JSON.stringify(avg, null, 2));
			
		}else{
			logger.info("The .vpf file contains error".red);
		}
		
		});
	})	
	
	// average with chart
	.command('averageChart', 'Compute the average note of each POI and export a Vega-lite chart')
	.alias('avgChart')
	.argument('<file>', 'The Vpf file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new VpfParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var avg = analyzer.parsedPOI.map(p => {
				var m = 0	
				// compute the average for each POI
				if(p.ratings.length > 0){
					m = p.ratings.reduce((acc, elt) => acc + parseInt(elt), 0) / p.ratings.length;
				}
				p["averageRatings"] = m;
				return p;
			})
			
			var avgChart = {
				//"width": 320,
				//"height": 460,
				"data" : {
						"values" : avg
				},
				"mark" : "bar",
				"encoding" : {
					"x" : {"field" : "name", "type" : "nominal",
							"axis" : {"title" : "Restaurants' name."}
						},
					"y" : {"field" : "averageRatings", "type" : "quantitative",
							"axis" : {"title" : "Average ratings for "+args.file+"."}
						}
				}
			}
			
			
			
			const myChart = vegalite.compile(avgChart).spec;
			
			/* SVG version */
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('svg').run();
			var mySvg = view.toSVG();
			mySvg.then(function(res){
				fs.writeFileSync("./result.svg", res)
				view.finalize();
				logger.info("%s", JSON.stringify(myChart, null, 2));
				logger.info("Chart output : ./result.svg");
			});
			
			/* Canvas version */
			/*
			var runtime = vg.parse(myChart);
			var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
			var myCanvas = view.toCanvas();
			myCanvas.then(function(res){
				fs.writeFileSync("./result.png", res.toBuffer());
				view.finalize();
				logger.info(myChart);
				logger.info("Chart output : ./result.png");
			})			
			*/
			
			
		}else{
			logger.info("The .vpf file contains error".red);
		}
		
		});
	})	
	
	
	// abc
	.command('abc', 'Organize POI in an Object grouped by name')
	.argument('<file>', 'The Vpf file to group by')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
		if (err) {
			return logger.warn(err);
		}
  
		analyzer = new VpfParser();
		analyzer.parse(data);
		
		if(analyzer.errorCount === 0){

			var abc = analyzer.parsedPOI.reduce(function(acc, elt){
				var idx = elt.name.charAt(0);
				if(acc[idx]){
					acc[idx].push(elt);
				}else{
					acc[idx] = [elt];
				}
				return acc;
			}, {})

			logger.info("%s", JSON.stringify(abc, null, 2));
			
		}else{
			logger.info("The .vpf file contains error".red);
		}
		
		});
	})
	*/
	
	// check CRU
	.command('check', 'Verifier si <repertoire> contient des salles réservées plusieurs fois sur le même créneau')
	.argument('<repertoire>', 'Le répertoire à vérifier')
	.action((args,logger) => { 
		
		// Correction ici pour passer les arguments correctement 
		console.log(`Vérification des conflits dans le répertoire: ${args.args.repertoire}`); 
		
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
		.map(file => { const content = readCruFile(path.join(args.repertoire, file)); 
			if (!isValidCruFile(content)) { 
				console.log(`Fichier invalide trouvé: ${file}`); 
				process.exit(1); // Arrêtez la commande 
				} 
			return content; 
		});
        /*.map(file => readCruFile(path.join(args.repertoire, file))); */
		 
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
	
