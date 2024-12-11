const ical = require('ical-generator').default;
const colors = require('colors');
const fs = require('fs');
const path = require('path');
const CruParser = require('./CruParser');
const CRNO = require('./CRNO');

function parseCruDirectory(parser, directorypath, logger) {
    let files = fs.readdirSync(directorypath, {recursive: true });
	try{
       files.forEach(file => {
                if (path.extname(file) === ".cru"){
                    parseCruFile(parser, directorypath + file, logger);
                }
         })
    }catch (err){
	    logger.warn(err);
    }
}

function parseCruFile(parser, filepath, logger) {
    try{
    	let data = fs.readFileSync(filepath, 'utf8');
    	
    	parser.parse(data);
    	
		if(parser.errorCount !== 0){
            logger.info(("Le fichier " + filepath + " contient une erreur.").red);
        }
    
    }catch(err){;
		logger.warn(err);
    }
}

function generateICal(courses, outputFilename) {
    const calendar = ical({ name: 'Emploi du Temps' });
    if (courses.length === 0) { 
        console.log("Aucun cours trouvé pour l'UE spécifiée."); 
    } 
    else { 
        courses.forEach(course => { 
            console.log(`Ajout du cours: ${course.ue}, ${course.hdeb} - ${course.hfin}`); 
            calendar.createEvent({ 
                debut: `jour:${course.jour} heur: ${course.hdeb}`, 
                fin: `jour:${course.jour} heur: ${course.hfin}`, 
               // end: new Date(`${course.jour}T${course.hfin}:00`), 
                summary: course.ue, 
                location: course.salle,
                 description: `Type: ${course.type}, Capacite: ${course.capacite}` 
                }); 
            });
        }
        //calendar.save(outputFilename); 
        const calendarContent = calendar.toString();
        fs.writeFileSync(outputFilename, calendarContent, 'utf8'); 
        console.log(outputFilename)
        console.log(`Fichier iCalendar sauvegardé sous ${outputFilename}`);
    
}


function getSallesByUE(ue, crno) { 
    courses = crno.filter(course => course.ue && course.ue.trim().toLowerCase() === ue.trim().toLowerCase()); 
    const salles = new Set(courses.map(course => course.salle)); 
    return [...salles]; 
}

function checkForConflicts(courses) {
    // Utiliser un dictionnaire pour stocker les réservations de salles par créneau horaire 
    const scheduleMap = {}; 
    const conflicts = []; 
    courses.forEach(course => { 
        const key = `${course.jour}_${course.hdeb}_${course.hfin}_${course.salle}`; 
        if (!scheduleMap[key]) { scheduleMap[key] = new Set(); } 
        
        // Si la salle est déjà réservée pour un créneau par une autre UE, il y a un conflit 
        if (scheduleMap[key].size > 0 && !scheduleMap[key].has(course.ue)) { 
            conflicts.push(`Conflit: Salle ${course.salle} réservée plusieurs fois le ${course.jour} de ${course.hdeb} à ${course.hfin} 
                pour les UEs ${Array.from(scheduleMap[key]).join(', ')} et ${course.ue}`);
        }
    
        scheduleMap[key].add(course.ue);
    })
    return conflicts; 
}

module.exports = {parseCruDirectory, parseCruFile, generateICal , getSallesByUE, checkForConflicts};
