var CRU = require('./CRU');


// VpfParser

var VpfParser = function(sTokenize, sParsedSymb){
	// The list of POI parsed from the input file.
	this.parsedCRU = [];
	this.symb = ["Capacite", "UE", "Horaire", "Salle", "$$"];
	this.showTokenize = sTokenize;
	this.showParsedSymbols = sParsedSymb;
	this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
VpfParser.prototype.tokenize = function(data){
	var separator = /(\r\n|: )/;
	data = data.split(separator);
	data = data.filter((val, idx) => !val.match(separator)); 					
	return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
VpfParser.prototype.parse = function(data){
	var tData = this.tokenize(data);
	if(this.showTokenize){
		console.log(tData);
	}
	this.listPoi(tData);
}

// Parser operand

VpfParser.prototype.errMsg = function(msg, input){
	this.errorCount++;
	console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
VpfParser.prototype.next = function(input){
	var curS = input.shift();
	if(this.showParsedSymbols){
		console.log(curS);
	}
	return curS
}

// accept : verify if the arg s is part of the language symbols.
VpfParser.prototype.accept = function(s){
	var idx = this.symb.indexOf(s);
	// index 0 exists
	if(idx === -1){
		this.errMsg("symbol "+s+" unknown", [" "]);
		return false;
	}

	return idx;
}



// check : check whether the arg elt is on the head of the list
VpfParser.prototype.check = function(s, input){
	if(this.accept(input[0]) == this.accept(s)){
		return true;	
	}
	return false;
}

// expect : expect the next symbol to be s.
VpfParser.prototype.expect = function(s, input){
	if(s == this.next(input)){
		//console.log("Reckognized! "+s)
		return true;
	}else{
		this.errMsg("symbol "+s+" doesn't match", input);
	}
	return false;
}


// Parser rules

// <liste_poi> = *(<poi>) "$$"
VpfParser.prototype.listcru = function(input){
	this.cru(input);
	this.expect("$$", input);
}

// <poi> = "START_POI" <eol> <body> "END_POI"
VpfParser.prototype.Cru = function(input){

	if(this.check("+", input)){
		this.expect("+", input);
		var args = this.body(input);
		var c = new CRU();
		this.note(input, p);
		this.expect("// +",input);
		this.parsedPOI.push(p);
		if(input.length > 0){
			this.(input);
		}
		return true;
	}else{
		return false;
	}

}

// <UE> ; UE : nom de l'ue
VpfParser.prototype.UE = function(input){
	this.expect("+",input)
	var curS = this.next(input);
	if(matched = curS.match(/[\wàéèêîù'\s]+/i)){
		return matched[0];
	}else{
		this.errMsg("Invalid name", input);
	}
}
// <Horaire> ; Horaire : nom du jour et l'heure
VpfParser.prototype.Horaire = function(input){
	this.expect("H=",input)
	var curS = this.next(input);
	if(matched = curS.match(/(-?\d+(\.\d+)?);(-?\d+(\.\d+)?)/)){
		return matched[0]
	}else{
		this.errMsg("pas d'horaire", input);
	}
}

// capacité de la salle
VpfParser.prototype.Capacité = function (input){
	this.expect("P=", input);
	var curS = this.next(input);
	if(matched = curS.match(/[0-100]/)){
		return matched[0]	}
	}else{
		this.errMsg("Invalid capacity");
}	

// nom de la salle
VpfParser.prototype.Salle = function (input){
	this.expect("S=", input);
	var curS = this.next(input);
	if(matched = curS.match(/[\wàéèêîù'\s]+/i)){
		return matched[0]	}
	}else{
		this.errMsg("Invalid name salle")

}
module.exports = VpfParser;