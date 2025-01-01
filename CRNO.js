var CRNO = function(ue, t, c, j, hd, hf, grp, s){
    this.ue = ue;
	this.type = t;
	this.capacite = c;
	this.jour = j;
	this.hdeb = hd;
	this.hfin = hf;
	this.groupe = grp;
	this.salle = s;
}

// Méthode qui compare si deux cours ont le même horaire
CRNO.prototype.memeHoraire = function(crno){
	if (this.jour === crno.jour){
	   if (this.hdeb === crno.hdeb){
	       return this.hfin === crno.hfin;
	   }
	}
	return false;
};

// Méthode qui compare si deux cours ont lieu dans la même salle
CRNO.prototype.memeSalle = function(crno){
	return this.salle === crno.salle;
};

// Méthode qui compare si deux cours ont la même capacité
CRNO.prototype.memeCapacite = function(crno){
	return this.capacite === crno.capacite;
};
// Méthode qui compare si deux cours sont dans la même unité d'enseignement (UE)
CRNO.prototype.memeUE = function(crno){
	return this.ue === crno.ue;
};

// Méthode qui compare si l'heure de début d'un cours est plus tard que l'autre
CRNO.prototype.plusTard = function(crno){
    let thisStartHour = parseInt(this.hdeb.split(':')[0]);
    let otherStartHour = parseInt(crno.hdeb.split(':')[0]);
	return this.jour === crno.jour && thisStartHour > otherStartHour;
};

// Méthode qui compare si la capacité d'un cours est plus grande que celle de l'autre
CRNO.prototype.plusGrand = function(crno){
	return this.capacite > crno.capacite;
};

module.exports = CRNO;
