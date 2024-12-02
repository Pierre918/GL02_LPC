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
	
CRNO.prototype.memeHoraire = function(crno){
	if (this.jour === crno.jour){
	   if (this.hdeb === crno.hdeb){
	       return this.hfin === crno.hfin;
	   }
	}
	return false;

};

CRNO.prototype.memeSalle = function(crno){
	return this.salle === crno.salle;
};

CRNO.prototype.memeCapacite = function(crno){
	return this.capacite === crno.capacite;
};

CRNO.prototype.memeUE = function(crno){
	return this.ue === crno.ue;
};

CRNO.prototype.plusTard = function(crno){
    let thisStartHour = parseInt(this.hdeb.split(':')[0]);
    let otherStartHour = parseInt(crno.hdeb.split(':')[0]);
	return this.jour === crno.jour && thisStartHour > otherStartHour;
};

CRNO.prototype.plusGrand = function(crno){
	return this.capacite > crno.capacite;
};

module.exports = CRNO;
