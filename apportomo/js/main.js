"use strict";

function arrSum(arr) {
	var sum = 0;
	arr.forEach(function(n) {
		sum += n;
	});

	return sum;
}

function arrMin(arr) {
	var min = Infinity;
	arr.forEach(function(n) {
		if(n < min) min = n;
	});

	return min;
}

function arrMax(arr) {
	var max = -Infinity;
	arr.forEach(function(n) {
		if(n > max) max = n;
	});

	return max;
}

function putArrInTable(arr, table) {
	var row = table.insertRow();
	arr.forEach(function(x) {
		row.insertCell().innerHTML = x;
	});
}

function hhRound(n) {
	var lower = Math.floor(n);
	var upper = Math.ceil(n);
	var geomMean = Math.sqrt(lower * upper);

	if(n < geomMean) {
		return lower;
	} else {
		return upper;
	}
}

function Apport() {
	this.seats = Math.floor(Math.random() * 30) + 30;
	
	this.states = [
		["Pennsylvania", 0],
		["New Jersey", 0],
		["California", 0],
		["North Carolina", 0],
		["Georgia", 0],
		["New York", 0],
		["Arizona", 0],
		["Idaho", 0],
		["Texas", 0],
		["Maine", 0]];

	var numStates = this.states.length;
	for(var i = 0; i < numStates; i++) {
		this.states[i][1] = Math.floor(Math.random() * 10000 * (numStates - i)) + 1000;
	}

	this.addStatesToTable = function(table, pre) {
		var namesRow = table.createTHead().insertRow(0);

		if(pre !== undefined) namesRow.insertCell().innerHTML = pre;

		this.states.forEach(function(state) {
			namesRow.insertCell().innerHTML = state[0];
		});
	};

	this.addPopsToTable = function(table) {
		var popRow = table.insertRow();
		this.states.forEach(function(state) {
			popRow.insertCell().innerHTML = state[1];
		});
	};

	this.getTotalPop = function() {
		var totalPop = 0;
		this.states.forEach(function(state) {
			totalPop += state[1];
		});

		return totalPop;
	};

	this.getStdDiv = function() {
		return this.getTotalPop() / this.seats;
	};
}

function Hamilton(apport) {
	var stdDiv = apport.getStdDiv();

	this.addToTable = function(table) {
		var row = table.insertRow();

		apport.states.forEach(function(state) {
			var numSeats = Math.floor(state[1] / stdDiv);
			if(numSeats === 0) numSeats = 1;

			row.insertCell().innerHTML = numSeats;
		});
	};

	this.getRange = function() { return [stdDiv, stdDiv];};
}

function RoundMethod(apport, roundFunc) {
	this.testAppt = function(stdDiv) {
		var reps = [];

		apport.states.forEach(function(state) {
			var numReps = roundFunc(state[1] / stdDiv);
			if(numReps === 0) numReps = 1;
			reps.push(numReps);
		});

		return reps;
	};

	this.getRange = function() {
		var initStdDiv = Math.floor(apport.getStdDiv());
		var highDiv = initStdDiv, lowDiv = initStdDiv;
		
		var validDivs = [];
		var lastLen = validDivs.length;

		var checkDiv = function(div) {
			var appt = arrSum(this.testAppt(div));
			if(appt === apport.seats) validDivs.push(div);
		}.bind(this);

		while(validDivs.length === 0 || validDivs.length !== lastLen) {
			lastLen = validDivs.length;

			checkDiv(highDiv);
			checkDiv(lowDiv);

			highDiv++;
			lowDiv--;
		}

		return [arrMin(validDivs), arrMax(validDivs)];
	};
}

function QuotaUppers(apport) {
	this.uppers = [];

	var totalPop = apport.getTotalPop();
	apport.states.forEach(function(state) {
		var stateApports = [];
		for(var i = 1; i <= apport.seats; i++) {
			stateApports.push(Math.ceil(i*state[1]/totalPop));
		}

		this.uppers.push(stateApports);
	}.bind(this));

	this.addToTable = function(table) {
		apport.addStatesToTable(table, ["Round #"]);
		for(var j = 0; j < this.uppers[0].length; j++) {
			var row = table.insertRow();
			row.insertCell().innerHTML = j+1;
			for(var i = 0; i < this.uppers.length; i++) {
				row.insertCell().innerHTML = this.uppers[i][j];
			}
		}
	};
}

function QuotaMethod(apport, quotaUppers) {
	// record [state pop, appointed seats]
	var currStatePops = [];
	apport.states.forEach(function(state) {
		currStatePops.push([state[1], 0]);
	});

	var uppers = quotaUppers.uppers;

	for(var seats = apport.seats; seats > 0; seats--) {
		var maxPopI = 0;
		// divide state pops, and find max state pop
		for(var i = 0; i < currStatePops.length; i++) {
			currStatePops[i][0] /= currStatePops[i][1] + 1;

			if(currStatePops[i] > currStatePops[maxPopI] && 
					currStatePops[i][1] < uppers[i][apport.seats-seats]) {
				maxPopI = i;
			}
		}

		currStatePops[maxPopI][1]++;
	}

	this.results = [];
	currStatePops.forEach(function(stateApport) {
		this.results.push(stateApport[1]);
	}.bind(this));

	this.addToTable = function(table) {
		apport.addStatesToTable(table);
		var row = table.insertRow();
		currStatePops.forEach(function(stateApport) {
			row.insertCell().innerHTML = stateApport[1];
		});
	};
}

function run() {
	var apport = new Apport();

	var numSeats = document.getElementById("numSeats");
	numSeats.innerHTML = apport.seats;

	var totalPop = document.getElementById("totalPop");
	totalPop.innerHTML = apport.getTotalPop();

	var stdDiv = document.getElementById("stdDiv");
	stdDiv.innerHTML = Math.round(apport.getStdDiv() * 1000) / 1000;

	var statesTable = document.getElementById("statesTable");
	apport.addStatesToTable(statesTable);
	apport.addPopsToTable(statesTable);

	var hamiltonTable = document.getElementById("hamiltonTable");
	apport.addStatesToTable(hamiltonTable);
	new Hamilton(apport).addToTable(hamiltonTable);

	var methodInfos = [
		["jefferson", Math.floor],
		["webster", Math.round],
		["adams", Math.ceil],
		["hh", hhRound]];

	methodInfos.forEach(function(methodInfo) {
		var method = new RoundMethod(apport, methodInfo[1]);

		var range = method.getRange();
		var rangeSpan = document.getElementById(methodInfo[0] + "Range");
		rangeSpan.innerHTML = range;

		var table = document.getElementById(methodInfo[0] + "Table");
		apport.addStatesToTable(table);
		putArrInTable(method.testAppt((range[0]+range[1])/2), table);
	});

	var quotaTable = document.getElementById("quotaTable");
	var quotaUppers = new QuotaUppers(apport);
	quotaUppers.addToTable(quotaTable);

	var quotaMethod = new QuotaMethod(apport, quotaUppers);
	var quotaResultsTable = document.getElementById("quotaResults");
	quotaMethod.addToTable(quotaResultsTable);
}
run();
