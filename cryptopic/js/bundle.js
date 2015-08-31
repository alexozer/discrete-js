(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/alex/code/js/cryptopic/js/main.js":[function(require,module,exports){
"use strict";

var colors = ["red", "orange", "yellow", "lightgreen", "darkgreen", "lightblue", "darkblue", "purple"];

function printKey(table) {
	var colorRow = table.insertRow(0);
	colorRow.insertCell(0).innerHTML = "Color";

	var codeRow = table.insertRow(1);
	codeRow.insertCell(0).innerHTML = "Code";

	for(var i = 0; i < colors.length; i++) {
		var block = new Block(i);
		colorRow.insertCell(i+1).style.backgroundColor = colors[i];
		codeRow.insertCell(i+1).innerHTML = block.toString();
	}
}

function ColorGrid() {
	this.gridSize = 600;

	this.numRows = 8;
	this.numColors = 8;

	this.blockSize = this.gridSize / this.numRows;

	this.canvas = document.getElementById("graph0");
	this.canvas.width = this.canvas.height = this.gridSize;
	this.context = this.canvas.getContext("2d");

	this.blocks = [];

	// Populate the grid
	for(var i = 0; i < this.numRows * this.numRows; i++) {
		this.blocks.push(new Block());
	}
}

ColorGrid.prototype = {
	constructor: ColorGrid,

	drawColorGrid: function() {
		for(var row = 0; row < this.numRows; row++) {
			for(var col = 0; col < this.numRows; col++) {
				var blockI = row * this.numRows + col;

				var colorI = 0;
				if(this.blocks[blockI].bits[0]) colorI += 4;
				if(this.blocks[blockI].bits[1]) colorI += 2;
				if(this.blocks[blockI].bits[2]) colorI += 1;

				this.context.fillStyle = colors[colorI];

				var startX = col * this.blockSize;
				var startY = row * this.blockSize;

				this.context.fillRect(startX, startY, startX + this.blockSize, startY + this.blockSize);
			}
		}
	},

	printBlocks: function(table, useErrors, base) {
		useErrors = useErrors !== undefined ? useErrors : true;
		base = base !== undefined ? base : 2;

		for(var row = 0; row < this.numRows; row++) {
			var rowElem = table.insertRow(row);
			for(var col = 0; col < this.numRows; col++) {
				var blockI = row * this.numRows + col;

				var cellElem = rowElem.insertCell(col);
				var block = this.blocks[blockI];
				if(base === 10) {
					cellElem.innerHTML = block.toNumber();
				} else {
					cellElem.innerHTML = block.toString();
				}

				if(block.mistakeI !== undefined && useErrors) {
					cellElem.style.backgroundColor = "pink";
				}
			}
		}
	},

	addCheckBits: function() {
		this.blocks.forEach(function(block) {
			block.addCheckBits();
		});
	},

	corrupt: function(numBlocks) {
		var blockPicks = [];
		for(var i = 0; i < this.blocks.length; i++) {
			blockPicks.push(i);
		}

		for(var blockNum = 0; blockNum < numBlocks; blockNum++) {
			var blockI = Math.floor(Math.random() * blockPicks.length);
			this.blocks[blockI].corrupt();
			blockPicks.splice(blockI, 1);
		}
	},

	getEncodedBlocks: function(matrix) {
		var encoded = [];

		for(var i = 0; i < this.blocks.length; i += 2) {
			var nextEncoded = matrix.encode(
					this.blocks[i].toNumber(),
					this.blocks[i+1].toNumber());

			encoded.push(nextEncoded.f, nextEncoded.s);
		}

		return encoded;
	},

	printEncodedBlocks: function(table, encoded) {
		for(var row = 0; row < this.numRows; row++) {
			var rowElem = table.insertRow(row);
			for(var col = 0; col < this.numRows; col += 2) {
				var blockI = row * this.numRows + col;

				rowElem.insertCell(col).innerHTML = encoded[blockI];
				rowElem.insertCell(col+1).innerHTML = encoded[blockI + 1];
			}
		}
	}
};

function Block(colorI) {
	this.bits = [false, false, false, false, false, false];

	if(colorI === undefined) {
		for(var i = 0; i < 3; i++) {
			this.bits[i] = Math.random() <= 0.5;
		}

		return;
	}

	if(colorI >= 4) {
		this.bits[0] = true;
		colorI -= 4;
	}

	if(colorI >= 2) {
		this.bits[1] = true;
		colorI -= 2;
	}

	if(colorI >= 1) {
		this.bits[2] = true;
	}

}

Block.prototype = {
	constructor: Block,

	toString: function() {
		var str = "";

		this.bits.forEach(function(bit) {
			str += bit ? 1 : 0;
		});

		return str;
	},

	addCheckBits: function() {
		this.bits[3] = this.bits[0] !== this.bits[1];
		this.bits[4] = this.bits[0] !== this.bits[2];
		this.bits[5] = this.bits[1] !== this.bits[2];
	},

	corrupt: function() {
		this.mistakeI = Math.floor(Math.random() * this.bits.length);
		this.bits[this.mistakeI] = !this.bits[this.mistakeI];
	},

	toNumber: function() {
		var n = 0;

		for(var i = 0; i < this.bits.length; i++) {
			n += this.bits[i] ? Math.pow(2, this.bits.length - i - 1) : 0;
		}

		return n;
	}
};

function Matrix() {
	this.a = 1;
	this.b = 3;
	this.c = 4;
	this.d = 2;
}

Matrix.prototype = {
	constructor: Matrix,

	encode: function(x, y) {
		return {
			f: this.a * x + this.b * y,
			s: this.c * x + this.d * y
		};
	},

	decode: function(f, s) {
		var cDivA = this.c / this.a;
		var y = (s - cDivA * f) / (this.d - this.b * cDivA);
		var x = (f - this.b * y) / this.a;

		return {
			x: x,
			y: y
		};
	}
};

var keyTable = document.getElementById("keyTable");
printKey(keyTable);

var grid = new ColorGrid();

grid.drawColorGrid();

var table0 = document.getElementById("table0");
grid.printBlocks(table0);

grid.addCheckBits();
var table1 = document.getElementById("table1");
grid.printBlocks(table1);

grid.corrupt(10);
var table2 = document.getElementById("table2");
grid.printBlocks(table2);

var table3 = document.getElementById("table3");
grid.printBlocks(table3, false, 10);

var matrix = new Matrix();
var encoded = grid.getEncodedBlocks(matrix);

var table4 = document.getElementById("table4");
grid.printEncodedBlocks(table4, encoded);

var output = document.getElementById("output");
output.innerHTML = JSON.stringify(encoded);


},{}]},{},["/home/alex/code/js/cryptopic/js/main.js"]);
