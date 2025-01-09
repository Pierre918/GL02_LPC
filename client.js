const fs = require('fs');
const CruParser = require('./CruParser.js');
const colors = require('colors');

const path = require('path');
const ical = require('ical-generator').default
const vg = require('vega');
const vegalite = require('vega-lite');
const cli = require("@caporal/core").default;
const {parseCruDirectory, parseCruFile, generateICal , getSallesByUE, checkForConflicts} = require('./fonction_check.js')


cli
	.version('cru-parser-cli')
	.version('0.07')
	
	// check CRU
	.command('check', 'Verifier si <fichier> contient des salles réservées plusieurs fois sur le même créneau')
	.argument('<fichier>', 'Le fichier .cru à lire')
	.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
        // Lire les fichiers		
        var analyzer = new CruParser();
        if(options.repertoire){
            parseCruDirectory(analyzer, args.fichier, logger);
        }
        else{
            parseCruFile(analyzer, args.fichier, logger);
        }
        // Si les données sont correctes
        if(analyzer.errorCount === 0){
        
            // Vérifier la présence de conflits
            const conflicts = checkForConflicts(analyzer.parsedCRNO); 
            if (conflicts.length === 0) { 
                logger.info('Aucun conflit de réservation de salle trouvé.'); 
            } 
            else { 
                logger.info('Conflits trouvés:'); 
                conflicts.forEach(conflict => logger.info(conflict)); 
            } 
        }
	})

	// salles d'une UE
	.command('sallesUE', 'Afficher les salles utilisées par <UE> à partir des données de <fichier>')
	.argument('<fichier>', 'Le fichier .cru à lire')
	.argument('<UE>', "L'UE dont on veut afficher les salles")
	.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
	.action(({ args, options, logger }) => { 
    // Vérifier le bon format des arguments
        if(!args.ue.match(/([a-zA-Z0-9][a-zA-Z0-9]+)/)){
            return logger.warn("Le terme " + args.ue + " n'est pas un nom d'UE valide. Un nom d'UE contient au moins deux caractères.");
        }
        
        // Lire les fichiers
        var analyzer = new CruParser();
        if(options.repertoire){
            parseCruDirectory(analyzer, args.fichier, logger);
        }
        else{
            parseCruFile(analyzer, args.fichier, logger);
        }
        
        // Si les données sont correctes
        if(analyzer.errorCount === 0 /*&& checkForConflicts(analyzer.parsedCRNO).length == 0*/){
            // Récupérer les salles pour l'UE'
            const salles = getSallesByUE(args.ue,analyzer.parsedCRNO); 
            if (salles.length === 0) { 
                logger.info(`Aucune salle trouvée pour l'UE ${args.ue}.`); 
                
            } 
            
            else { 
                logger.info(`Salles utilisées pour l'UE ${args.ue}: ${salles.join(', ')}`); 
                
            } 
        }
        
    })

	// capacite d'une salle 
	.command('capacite', 'Afficher la capicité de <salle> à partir des données de <fichier>')
	.argument('<fichier>', 'Le fichier .cru à lire')
	.argument('<salle>', 'La salle dont on veut afficher la capacite')
	.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {	
        // Vérifier le bon format des arguments
        if(!args.salle.match(/[a-zA-Z0-9]{4}/)){
            return logger.warn("Le terme " + args.ue + " n'est pas un nom de salle valide. Un nom de salle contient quatre caractères.");
        }
        
        // Lire les fichiers
        var analyzer = new CruParser();
        if(options.repertoire){
            parseCruDirectory(analyzer, args.fichier, logger);
        }
        else{
            parseCruFile(analyzer, args.fichier, logger);
        }
        
        // Si les données sont correctes
        if(analyzer.errorCount === 0 && checkForConflicts(analyzer.parsedCRNO).length == 0){
            // Récupérer toutes les valeurs données pour la capacité de la salle
            let capacite = []
            analyzer.parsedCRNO.forEach(crno =>{
                if(crno.salle === args.salle){
                    capacite.push(crno.capacite);
                }
            })
            if(capacite.length === 0){
                logger.info('Aucune donnée pour la salle ' + args.salle + '.');
            }
            else{
            // C    alculer le maximum de la liste de capacités
                let capmax = Math.max(...capacite);
                logger.info('La salle ' + args.salle + ' possède ' + capmax +' places.');
            }
        }
    })	

	// creneaux libres d'une ou plusieurs salle(s)
	.command('creneau', 'Afficher les créneaux où <salle> est libre à partir des données de <fichier>')
	.argument('<fichier>', 'Le fichier .cru à lire')
	.argument('<salle...>', 'La ou les salle(s) dont on veut afficher les créneaux libres')
	.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {	
        // Vérifier le bon format des arguments
        args.salle.forEach(s => {
            if(!s.match(/[a-zA-Z0-9]{4}/)){
                return logger.warn("Le terme " + s + " n'est pas un nom de salle valide. Un nom de salle contient quatre caractères.");
            }
        });
        
        // Lire les fichiers
        var analyzer = new CruParser();
        if(options.repertoire){
            parseCruDirectory(analyzer, args.fichier, logger);
        }
        else{
            parseCruFile(analyzer, args.fichier, logger);
        }
        
        // Si les données sont correctes
        if(analyzer.errorCount === 0 && checkForConflicts(analyzer.parsedCRNO).length == 0){
            let jours = ["L", "MA", "ME", "J", "V", "S"];
            let heures = [8,9,10,11,12,13,14,15,16,17,18,19];
            
            // Pour chaque salle passée en argument
            args.salle.forEach(salle => {
                logger.info(salle + " disponible : ");
                let concernedCrno = analyzer.parsedCRNO.filter(crno => crno.salle === salle);
                
                // Regarder la disponibilité jour par jour
                jours.forEach(jour =>{
                    logger.info(" - " + jour);
                    
                    // Récupérer la liste des heures et demies-heures où la salle est occupée
                    let hPrises = []
                    concernedCrno.filter(crno => crno.jour === jour).forEach(crnoBonJour => {
                        let debut = crnoBonJour.hdeb;
                        while(debut !== crnoBonJour.hfin){
                            hPrises.push(debut);
                            let heure = parseInt(debut.split(':')[0]);
                            let min = parseInt(debut.split(':')[1]);
                            if(min === 30){
                                min = "00";
                                heure = heure + 1;
                            } else {
                                min = 30;
                            }
                            debut = heure + ":" + min;
                        }
                    });
                    
                    // Déterminer les intervalles où la salle n'est pas occupée
                    let startHour = heures[0] + ":00";
                    let endHour = (heures[heures.length - 1]+1) + ":00";
                    heures.forEach(heure =>{
                        if(hPrises.includes(heure + ":00")){
                            if(startHour !== heure + ":00"){
                            logger.info("    - " + startHour + "-" + heure + ":00");
                            }
                            startHour = heure + ":30";
                        }
                        if(hPrises.includes(heure + ":30")){
                            if(startHour !== heure + ":30"){
                                logger.info("    - " + startHour + "-" + heure + ":30");
                            }
                            startHour = (heure + 1) + ":00";
                        }
                    });
                    if(startHour !== endHour){
                        logger.info("    - " + startHour + "-" + endHour);
                    }
                });
                logger.info("");
            });
        }
    })	

// salles libres 
.command('sallesLibres', 'Afficher les salles libres sur le créneau du <jour> de <heureDebut> à <heureFin> à partir des données de <fichier>')
.argument('<fichier>', 'Le fichier .cru à lire')
.argument('<jour>', 'Le jour du créneau, L, MA, ME, J, V ou S')
.argument('<heureDebut>', "L'heure de début du créneau, au format hh:mm")
.argument('<heureFin>', "L'heure de fin du créneau, au format hh:mm")
.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
.action(({args, options, logger}) => {	
        // Vérifier le bon format des arguments
        let jours = ["L", "MA", "ME", "J", "V", "S"];
        if(!jours.includes(args.jour)){
            return logger.warn("Le terme " + args.jour + " n'est pas un jour valide. Les noms de jour valides sont L, MA, ME, J, V ou S");
        }
        if(!args.heureDebut.match(/\d\d?:\d\d/)){
            return logger.warn("Le terme " + args.heureDebut + " n'est pas une heure valide. Utilisez le format hh:mm.");
        }
        if(!args.heureFin.match(/\d\d?:\d\d/)){
            return logger.warn("Le terme " + args.heureFin + " n'est pas une heure valide. Utilisez le format hh:mm.");
        }
        
        // Lire les fichiers 
        var analyzer = new CruParser();
        if(options.repertoire){
            parseCruDirectory(analyzer, args.fichier, logger);
        }
        else{
            parseCruFile(analyzer, args.fichier, logger);
        }
        
        // Si les données sont correctes
        if(analyzer.errorCount === 0 && checkForConflicts(analyzer.parsedCRNO).length == 0){
            // Séparer minutes et heures pour le créneau passé en argument
            let objStartHour = parseInt(args.heureDebut.split(':')[0]);
            let objEndHour = parseInt(args.heureFin.split(':')[0]);
            let objStartMin = parseInt(args.heureDebut.split(':')[1]);
            let objEndMin = parseInt(args.heureFin.split(':')[1]);
            
            let crnoConcurrents = analyzer.parsedCRNO.filter(crno => {
                // Séparer minutes et heures
                let crnoStartHour = parseInt(crno.hdeb.split(':')[0]);
                let crnoEndHour = parseInt(crno.hfin.split(':')[0]);
                let crnoStartMin = parseInt(crno.hdeb.split(':')[1]);
                let crnoEndMin = parseInt(crno.hfin.split(':')[1]);
                
                // Vérifier si le créneau est en même que le créneau passé en argument
                // => est le même jour
                let enMmTemps = args.jour === crno.jour;
                // => finit après qu'il aie commencé
                enMmTemps = enMmTemps && (objStartHour < crnoEndHour || (objStartHour == crnoEndHour && objStartMin < crnoEndMin));
                // => commence après qu'il aie fini
                enMmTemps = enMmTemps && (objEndHour > crnoStartHour || (objEndHour == crnoStartHour && objEndMin > crnoStartMin));
        
                return enMmTemps;
            });
            
            // Dresser la liste des salles occupées durant le créneau 
            let sallesPrises = [];
            crnoConcurrents.forEach(crno => {
                if(!sallesPrises.includes(crno.salle)){
                    sallesPrises.push(crno.salle);
                }
            });
            
            // Dresser la liste des autres salles, qui ne sonr pâs occupées durant le créneau
            let sallesLibres = [];
            analyzer.parsedCRNO.forEach(crno => {
                if(!sallesPrises.includes(crno.salle) && !sallesLibres.includes(crno.salle)){
                    sallesLibres.push(crno.salle);
                }
            });
            
            // Afficher la liste
            logger.info(`Salles libres le ${args.jour} à ${args.heureDebut}-${args.heureFin} :\n${sallesLibres.sort().join(', ')}`); 
        }
    })	

.command('graphique', 'Afficher un graphique du nombre de salles occupées en fonction du créneau à partir des données de <fichier>')
.argument('<fichier>', 'Le fichier .cru à lire')
.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
.option('-p, --periode <periode>', "Filtrer les données pour une période spécifique (format: JJ/MM/AAAA-JJ/MM/AAAA)")
.action(({ args, options, logger }) => {
    const analyzer = new CruParser();

    // Lire les fichiers
    if (options.repertoire) {
        parseCruDirectory(analyzer, args.fichier, logger);
    } else {
        parseCruFile(analyzer, args.fichier, logger);
    }

    // Si aucune donnée n'est disponible
    if (analyzer.parsedCRNO.length === 0) {
        logger.error("Aucune donnée disponible.");
        return;
    }

    // Gestion de la période
    let periodeDebut = null, periodeFin = null;
    if (options.periode) {
        const [debut, fin] = options.periode.split('-').map(dateStr => {
            if (!dateStr) {
                logger.error("Format de période incorrect. Utilisez JJ/MM/AAAA-JJ/MM/AAAA.");
                return null;
            }
            return new Date(dateStr.split('/').reverse().join('-'));
        });
        periodeDebut = debut;
        periodeFin = fin;

        if (!periodeDebut || !periodeFin) {
            logger.error("Les dates de période sont invalides.");
            return;
        }
    }

    // Séparer les créneaux avec et sans date
    const withDate = [];
    const withoutDate = [];
    analyzer.parsedCRNO.forEach(crno => {
        if (crno.date) {
            withDate.push(crno);
        } else {
            withoutDate.push(crno);
            logger.warn(`Créneau sans date ignoré : ${JSON.stringify(crno)}`);
        }
    });

    // Filtrer les créneaux avec date pour la période
    const filteredCRNO = withDate.filter(crno => {
        const crnoDate = new Date(crno.date.split('/').reverse().join('-'));
        return (!periodeDebut || !periodeFin || (crnoDate >= periodeDebut && crnoDate <= periodeFin));
    });

    if (filteredCRNO.length === 0 && withoutDate.length === 0) {
        logger.error("Aucune donnée disponible pour la période spécifiée.");
        return;
    }

    // Génération des statistiques
    const heures = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    const stats = heures.map(heure => {
        const creneau = {};
        creneau.nom = heure + ":00-" + (heure + 1) + ":00";

        const crnoConcurrents = filteredCRNO.filter(crno => {
            const crnoStartHour = parseInt(crno.hdeb.split(':')[0]);
            const crnoEndHour = parseInt(crno.hfin.split(':')[0]);
            return (crnoStartHour < (heure + 1) && crnoEndHour > heure);
        });

        creneau.nbSallesPrises = crnoConcurrents.length;
        return creneau;
    });

    // Ajouter une catégorie spéciale pour les créneaux sans date
    if (withoutDate.length > 0) {
        stats.push({
            nom: "Date inconnue",
            nbSallesPrises: withoutDate.length,
        });
    }

    // Configuration du graphique Vega
    const statsChart = {
        "data": {
            "values": stats
        },
        "mark": "bar",
        "encoding": {
            "x": { "field": "nom", "type": "nominal", "axis": { "title": "Créneau" } },
            "y": { "field": "nbSallesPrises", "type": "quantitative", "axis": { "title": "Nombre de salles prises" } }
        }
    };
    const myChart = vegalite.compile(statsChart).spec;

    // Exportation au format SVG
    const runtime = vg.parse(myChart);
    const view = new vg.View(runtime).renderer('svg').run();
    const mySvg = view.toSVG();
    mySvg.then(function (res) {
        fs.writeFileSync("./result.svg", res);
        view.finalize();
        logger.info("%s", JSON.stringify(myChart, null, 2));
        logger.info("Chart output : ./result.svg");
    });
})



	

// fichier iCalendar
// https://icalendar.org/validator.html <= testeur de fichier icalendar
.command('calendrier', 'Créer un fichier iCalendar avec le nom <nom>.cru, allant de <jourDebut> à <jourFin>, contenant les événements des <UE> à partir des données de <fichier>')
.argument('<fichier>', 'Le fichier .cru à lire')
.argument('<jourDebut>', 'Le jour où doit débuter le calendrier', {validator : ['L','MA','ME','J','V','S','D']})
.argument('<jourFin>', 'Le jour où doit finir le calendrier',{validator : ['L','MA','ME','J','V','S','D']})
.argument('<nom>', "Le nom de l'utilisateur")
.argument('<UE...>', "La liste des UE à ajouter au calendrier") 
.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
.action(({ args, options, logger }) => { 
	   // Vérifier le bon format des arguments
        let jours = ["L", "MA", "ME", "J", "V", "S"];
        if(!jours.includes(args.jourDebut)){
            return logger.warn("Le terme " + args.jourDebut + " n'est pas un jour valide. Les noms de jour valides sont L, MA, ME, J, V ou S");
        }
        if(!jours.includes(args.jourFin)){
            return logger.warn("Le terme " + args.jourFin + " n'est pas un jour valide. Les noms de jour valides sont L, MA, ME, J, V ou S");
        }
        if (args.jourDebut === args.jourFin) {
            return logger.warn("La date de début et la date de fin ne peuvent pas être identiques. Veuillez choisir un jour différent.");
        }
        for (const uei of args.ue){
            if(!uei.match(/([a-zA-Z0-9][a-zA-Z0-9]+)/)){
                return logger.warn("Le terme " + uei + " n'est pas un nom d'UE valide. Un nom d'UE contient au moins deux caractères.");
            }
        }
	    
	    // Lire les fichiers 
        var analyzer = new CruParser();
        if(options.repertoire){
            parseCruDirectory(analyzer, args.fichier, logger);
        }
        else{
            parseCruFile(analyzer, args.fichier, logger);
        }
        // Si les données sont correctes
        if(analyzer.errorCount === 0 && checkForConflicts(analyzer.parsedCRNO).length == 0){
            // let courses = [...new Set(analyzer.parsedCRNO.flatMap(crno => crno.ue))]; //pour éviter les doublons
    		// Filtrer les cours par UE
            const filteredCourses = analyzer.parsedCRNO.filter(elt => args.ue.includes(elt.ue));
    		 // Générer le fichier iCalendar 
    		generateICal(filteredCourses, `${args.nom}.ics`); 
    		//logger.info(`Fichier iCalendar généré pour ${args.nom}`);
    	}
	})

	// classer les salles 
	.command('classer', "Afficher un tableau avec la capacité maximale d'accueil des salles et le nombre de salles par capacité d'accueil, classé par ordre croissant de capacité, à partir des données de <fichier>")
	.argument('<fichier>', 'Le fichier .cru à lire')
	.option('-d, --decroissant', 'Ranger par ordre décroissant', { validator : cli.BOOLEAN, default: false })
	.option('-r, --repertoire', "Lire un répertoire de manière récursive au lieu d'un fichier", { validator : cli.BOOLEAN, default: false })
	.action(({args, options, logger}) => {
        // Lire les fichiers	
        var analyzer = new CruParser();
        if(options.repertoire){
            parseCruDirectory(analyzer, args.fichier, logger);
        }
        else{
            parseCruFile(analyzer, args.fichier, logger);
        }
        
        // Si les données sont correctes
        if(analyzer.errorCount === 0 && checkForConflicts(analyzer.parsedCRNO).length == 0){
            let dicoCapaciteSalles = new Map();
            let salles = [];
            analyzer.parsedCRNO.forEach(crno => {
                // Pour chaque salle, calculer sa capacite maximale
                if(!salles.includes(crno.salle)){
                    salles.push(crno.salle)
                    let capaciteListe = [];
                    analyzer.parsedCRNO.forEach(otherCrno =>{
                        if(otherCrno.salle === crno.salle){
                            capaciteListe.push(otherCrno.capacite);
                        }
                    })
                    let capaciteNb =  Math.max(...capaciteListe);
            
                    if(!dicoCapaciteSalles.has(capaciteNb)){
                        dicoCapaciteSalles.set(capaciteNb, 0);
                    }
                    dicoCapaciteSalles.set(capaciteNb, dicoCapaciteSalles.get(capaciteNb)+1);
                }
            })
            
            // Trier dans l'ordre croissant ou décroissant
            let cles = dicoCapaciteSalles.keys().toArray();
            if(!options.decroissant){
                cles = cles.sort()
            }
            else{
                cles = cles.sort((a, b) => b-a);
            }
            
            // Afficher les données
            logger.info("Capacite\t|   Nombre de salles")
            cles.forEach(capacite => {
                logger.info("   " + capacite + "\t|   " + dicoCapaciteSalles.get(capacite));
            })
        }
	})
    // enregistrer du texte
    .command('enregistrer', 'Enregistrer du texte dans un fichier .txt')
    .argument('<nomFichier>', 'Le nom du fichier .txt à créer')
    .argument('<texte>', 'Le texte à enregistrer')
    .action(({ args, logger }) => {
        fs.writeFile(`${args.nomFichier}.txt`, args.texte, (err) => {
            if (err) {
                logger.error('Erreur lors de la création du fichier:', err);
            } else {
                logger.info(`Fichier ${args.nomFichier}.txt créé avec succès.`);
            }
        });
    })
	
cli.run(process.argv.slice(2));
	
