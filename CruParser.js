var CRNO = require('./CRNO');


// CruParser

var CruParser = function(sTokenize, sParsedSymb){
	// The list of CRNO parsed from the input file.
	this.parsedCRNO = [];
	this.symb = ["+","1","P","H","F","S","//","Page"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
CruParser.prototype.tokenize = function(data){
	var toBeRemoved = /(\r\n|=|,)/;
	var splitter = /(\r\n|=|,|\+|Page|F|\/\/)/;
	data = data.split(splitter);
	data = data.filter((val, idx) => !val.match(toBeRemoved) && val !== '');
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
CruParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.listUE(tData);
}

// Parser operand

CruParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	if(input !== undefined){
	   console.log("Erreur de parsing ! sur " + input + " -- msg : " + msg);
	}
	else{
	   console.log("Erreur de parsing ! -- msg : " + msg);
	}
}

// Read and return a symbol from input
CruParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS;
}

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbole " + s + " inconnu", [" "]);
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
	if(s == this.next(input)){
		//console.log("Reconnu ! " + s);
		return true;
	}else{
		this.errMsg("le symbole " + s + " ne correspond pas à ", input);
	}
	return false;
}


// Parser rules

// <liste_ue> = <txtDebut> *(<ue>) "Page" *VCHAR
CruParser.prototype.listUE = function(input){
	let endOfTxt = input.indexOf("UVUV");
	let i = 0;
	while(i<=endOfTxt || input[0]!=='+'){
	   input.shift();
	  i++;
	}
	this.listCrno(input);
	this.expect("Page", input);
}

// <liste_crno> = *(<crno>) "Page" *VCHAR
CruParser.prototype.listCrno = function(input){
    if(this.check("+", input)){
		var ue = this.ue(input);
		this.crno(input, ue);
		if(input.length > 0){
			this.listCrno(input);
		}
		return true;
	}else{
		return false;
	}
}

// <crno> = "1" ”,” <body> “//”
CruParser.prototype.crno = function(input, ue){
	if(this.check("1", input)){
		this.expect("1", input);
		var args = this.body(input);
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

// <body> = <type> “," <capacite> ”," <creneau> “,” <groupe> “,” <salle>
CruParser.prototype.body = function(input){
	var typ = this.type(input);
	var cap = this.capacite(input);
	var crn = this.creneau(input);
	var grp = this.groupe(input);
	var sal = this.salle(input);
	return { typ: typ, cap: cap, jor: crn.jor, hdeb: crn.hdeb, hfin : crn.hfin, grp: grp, sal: sal };
}

// <ue> = "+" 2VCHAR 2DIGIT
CruParser.prototype.ue = function(input){
	this.expect("+",input)
	var curS = this.next(input);
	if(matched = curS.match(/([A-Z][A-Z]\d\d)/)){
		return matched[2];
	}else{
		this.errMsg("UE non valide", curS);
	}
}

// <type> = "C"/"D"/"T" DIGIT
CruParser.prototype.type = function(input){
	var curS = this.next(input);
	if(matched = curS.match(/(C|D|T)(\d+)/)){
		return matched[0];
	}else{
		this.errMsg("Type non valide", curS);
	}
}

// <capacite> = "P=" 1*3DIGIT
CruParser.prototype.capacite = function (input){
	this.expect("P", input);
	var curS = this.next(input);
	if(matched = curS.match(/[0-9][0-9]?[0-9]?/)){
		return matched[0];
	}else{
		this.errMsg("Capacité non valide", curS);
	}
}	

// <creneau> =  "L"/"MA"/"ME"/"J"/"V"/"S"/"D" WSP <heureDebut> "-" <heureFin>
CruParser.prototype.creneau = function(input){
	this.expect("H",input)
	var curS = this.next(input);
	if(matched = curS.match(/(L|MA|ME|J|V|S|D) (\d(\d)?:\d\d)-(\d(\d)?:\d\d)/)){
		return { jor: matched[1], hdeb: matched[2], hfin: matched[4] };
	}else{
		this.errMsg("Créneau non valide", curS);
		return { jor: "", hdeb: "", hfin: "" };
	}
}

// <groupe> = "F" "1"/"2"/"3"/"4"/"5"/"6"/"7"/"8"/"9"/
CruParser.prototype.groupe = function (input){
	this.expect("F", input);
	var curS = this.next(input);
	if(matched = curS.match(/[1-9]/)){
		return matched[0];
	}else{
		this.errMsg("Groupe non valide", curS);
	}
}	

// <salle> = VCHAR 3DIGIT
CruParser.prototype.salle = function (input){
	this.expect("S", input);
	var curS = this.next(input);
	if(matched = curS.match(/[A-Z]\d\d\d/)){
		return matched[0];
	}else{
		this.errMsg("Salle non valide", curS);
	}

}

module.exports = CruParser;
