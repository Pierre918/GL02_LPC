var CRNO = function(ue, j, hd, hf, s, c){
    this.ue = ue;
	this.jour = j;
	this.hdeb = hd;
	this.hfin = hf;
	this.salle = s;
	this.capacite = c;
}
	
POI.prototype.memeHoraire = function(crno){
	if (this.jour === crno.jour){
	   if (this.hdeb === crno.hdeb){
	       return this.hfin === crno.hfin;
	   }
	}
	return false;

};

POI.prototype.memeSalle = function(crno){
	return this.salle === crno.salle;
};

POI.prototype.memeCapacite = function(crno){
	return this.capacite === crno.capacite;
};

POI.prototype.memeUE = function(crno){
	return this.ue === crno.ue;
};

POI.prototype.plusTard = function(crno){
	return this.jour === crno.jour && this.hfin > crno.hfin;
};

POI.prototype.plusGrand = function(crno){
	return this.capacite > crno.capacite;
};

module.exports = POI;