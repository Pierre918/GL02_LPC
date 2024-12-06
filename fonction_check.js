const ical = require('ical-generator').default;
const fs = require('fs');
const path = require('path');
const CruParser = require('./CruParser');
const CRNO = require('./CRNO');

function readCruFile(filepath) { return fs.readFileSync(filepath, 'utf-8'); }

function parseCruData(data) {
    const parser = new CruParser(true, true); // Initialiser le parser avec les options de débogage
    parser.parse(data);
    return parser.parsedCRNO; // Retourner les objets CRNO analysés
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

function getSallesByUE(ue,cruFiles) { 
    const courses = cruFiles.flatMap(parseCruData) 
        .filter(course => course.ue && course.ue.trim().toLowerCase() === ue.trim().toLowerCase()); 
    const salles = new Set(courses.map(course => course.salle)); 
    return [...salles]; 
}

function checkForConflicts(repertoire) {
    // Vérifiez que 'repertoire' est une chaîne de caractères
    console.log(repertoire)
    if (typeof repertoire !== 'string') { 
        throw new Error(`Expected a string for 'repertoire', but got ${typeof repertoire}`); 
    } 
    const cruFiles = fs.readdirSync(repertoire) 
        .filter(file => path.extname(file) === '.cru') 
        .map(file => readCruFile(path.join(repertoire, file))); 
        const courses = cruFiles.flatMap(parseCruData); 
        // Utiliser un dictionnaire pour stocker les réservations de salles par créneau horaire 
        const scheduleMap = {}; 
        const conflicts = []; 
        courses.forEach(course => { 
            const key = `${course.jour}_${course.hdeb}_${course.hfin}`; 
            if (!scheduleMap[key]) { scheduleMap[key] = new Set(); } 
            if (scheduleMap[key].has(course.salle)) { 
                conflicts.push(`Conflit: Salle ${course.salle} réservée plusieurs fois le ${course.jour} de ${course.hdeb} à ${course.hfin}`); 
            } 
            else { 
                scheduleMap[key].add(course.salle); 
            } 
        }); 
        return conflicts; 
}

module.exports = {generateICal,parseCruData , getSallesByUE, checkForConflicts};
