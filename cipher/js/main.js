"use strict";

var button = document.getElementById("submit");
button.addEventListener("click", crack);

var textarea = document.getElementById("textarea");

function crack() {
	alert(textarea.getText());
}
