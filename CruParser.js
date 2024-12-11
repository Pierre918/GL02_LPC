var CRNO = require('./CRNO');


// CruParser

var CruParser = function(){
	// The list of CRNO parsed from the input file.
	this.parsedCRNO = [];
	this.symb = ["+","1","P","H","F","S","//","Page"];
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var toBeRemoved = /(\r\n|=|,)/;
	var splitter = /(\r\n|=|,|\+|Page|\/\/)/;
	data = data.split(splitter);
	data = data.filter((val, idx) => !val.match(toBeRemoved) && val !== '');
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
CruParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	this.listUE(tData);
}

// Parser operand

CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	if(input !== undefined && input !== " " && input !== ""){
	   console.log("Erreur de parsing sur " + input + " -- msg : " + msg);
	}
	else{
	   console.log("Erreur de parsing -- msg : " + msg);
	}
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	return curS;
}

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbole " + s + " inconnu", "");
		return false;
	}

	return idx;
}

// check : check whether the arg s is on the head of the list
CruParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
CruParser.prototype.expect = function(s, input){
    let next = this.next(input);
	if(s == next){
		//console.log("Reconnu ! " + s);
		return true;
	}else{
		this.errMsg(next + " ne correspond pas au symbole " + s, next);
	}
	return false;
}


// Parser rules

// <liste_ue> = <texte_debut> *(<nom_ue>) "Page" *VCHAR
CruParser.prototype.listUE = function(input){
    this.texteDebut(input);
	this.listCrno(input);
}

// <texte_debut> = “EDT.CRU - Test\n
//                 V�rifier ce qui se passe en cas de s�ance li�e avec salles multiples :\n
//                 Comportement souhait� : Si 2 seances li�e avec deux salles chacunes\n
//                 Seance 1 : salle 1 et 2 - Seance 2 : salle 3 et 4\n
//                 on doit avoir :\n
//                 +UVUV\n
//                 Seance 1 S=1 / Seance 2 S=3\n
//                 Seance 1 S=2 / Seance2 S=4\n"
CruParser.prototype.texteDebut = function(input){
    this.expect("EDT.CRU - Test", input);
    this.expect("V�rifier ce qui se passe en cas de s�ance li�e avec salles multiples :", input);
    this.expect("Comportement souhait� : Si 2 seances li�e avec deux salles chacunes", input);
    this.expect("Seance 1 : salle 1 et 2 - Seance 2 : salle 3 et 4", input);
    this.expect("on doit avoir :", input);
    this.expect("+", input);
    this.expect("UVUV", input);
    this.expect("Seance 1 S", input);
    this.expect("1 / Seance 2 S", input);
    this.expect("3", input);
    this.expect("Seance 1 S", input);
    this.expect("2 / Seance2 S", input);
    this.expect("4", input);
}

// <liste_crno> = *(<crno>) "Page" *VCHAR
CruParser.prototype.listCrno = function(input){
    if(this.check("+", input)){
		var ue = this.nom_ue(input);
		this.crno(input, ue);
		if(input.length > 0){
			this.listCrno(input);
		}
		return true;
	}else{
		return false;
	}
}

// <crno> = "1" ”,” <ligne_description> “//”
CruParser.prototype.crno = function(input, ue){
	if(this.check("1", input)){
		this.expect("1", input);
		var args = this.ligne_description(input);
		var c = new CRNO(ue, args.typ, args.cap, args.jor, args.hdeb, args.hfin, args.grp, args.sal);
		this.expect("//", input);
		this.parsedCRNO.push(c);
		if(input.length > 0 && this.check("1", input)){
		    this.crno(input, ue);
		}
		return true;
	}else{
		return false;
	}

}

// <ligne_description> = <type> “," <capacite> ”," <creneau> “,” <groupe> “,” <salle>
CruParser.prototype.ligne_description = function(input){
	var typ = this.variable(input);
	var cap = this.capacite(input);
	var crn = this.creneau(input);
	var grp = this.variable(input);
	var sal = this.salle(input);
	return { typ: typ, cap: cap, jor: crn.jor, hdeb: crn.hdeb, hfin : crn.hfin, grp: grp, sal: sal };
}

// <nom_ue> = "+" 2*VCHAR 
CruParser.prototype.nom_ue = function(input){
	this.expect("+",input);
	var curS = this.next(input);
	if(matched = curS.match(/([a-zA-Z0-9][a-zA-Z0-9]+)/)){
		return matched[1];
	}else{
		this.errMsg("UE non valide", curS);
	}
}

// <variable> = VCHAR DIGIT
CruParser.prototype.variable = function(input){
	var curS = this.next(input);	
	if(matched = curS.match(/[a-zA-Z0-9](\d)/)){
		return matched[0];
	}else{
		this.errMsg("Variable non valide", curS);
	}
}

// <capacite> = "P=" 1*3DIGIT
CruParser.prototype.capacite = function (input){	this.expect("P", input);
	var curS = this.next(input);
	if(matched = curS.match(/[0-9][0-9]?[0-9]?/)){
		return matched[0];
	}else{
		this.errMsg("Capacité non valide", curS);
	}
}	

// <creneau> =  1*2CHAR WSP <heureDebut> "-" <heureFin>
CruParser.prototype.creneau = function(input){
	this.expect("H",input)
	var curS = this.next(input);
	if(matched = curS.match(/([a-zA-Z][a-zA-Z]?) (\d(\d)?:\d\d)-(\d(\d)?:\d\d)/)){
		return { jor: matched[1], hdeb: matched[2], hfin: matched[4] };
	}else{
		this.errMsg("Créneau non valide", curS);
		return { jor: "", hdeb: "", hfin: "" };
	}
}

// <salle> = 4VCHAR
CruParser.prototype.salle = function (input){
	this.expect("S", input);
	var curS = this.next(input);
	if(matched = curS.match(/[a-zA-Z0-9]{4}/)){
		return matched[0];
	}else{
		this.errMsg("Salle non valide", curS);
	}

}

module.exports = CruParser;
