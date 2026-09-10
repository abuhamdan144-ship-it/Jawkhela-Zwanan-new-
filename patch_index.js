const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The faulty block:
/*
var _s=_sd.settings;if(_s){  if(_s.title) document.title=_s.title;  window.addEventListener('DOMContentLoaded', function() {    if(_s.heroLead) { var hl = document.querySelector('.hero p.lead'); if(hl) hl.textContent = _s.heroLead; }    if(_s.aboutText) { var at = document.querySelector('#about .sec-head p'); if(at) at.textContent = _s.aboutText; }  });}var _sd={};try{_sd=JSON.parse(localStorage.getItem('zj-site-content')||'{}')}catch(e){}
*/

const faultyBlock = `var _s=_sd.settings;if(_s){  if(_s.title) document.title=_s.title;  window.addEventListener('DOMContentLoaded', function() {    if(_s.heroLead) { var hl = document.querySelector('.hero p.lead'); if(hl) hl.textContent = _s.heroLead; }    if(_s.aboutText) { var at = document.querySelector('#about .sec-head p'); if(at) at.textContent = _s.aboutText; }  });}var _sd={};try{_sd=JSON.parse(localStorage.getItem('zj-site-content')||'{}')}catch(e){}`;

const fixedBlock = `var _sd={};try{_sd=JSON.parse(localStorage.getItem('zj-site-content')||'{}')}catch(e){}var _s=_sd.settings;if(_s){  if(_s.title) document.title=_s.title;  window.addEventListener('DOMContentLoaded', function() {    if(_s.heroLead) { var hl = document.querySelector('.hero p.lead'); if(hl) hl.textContent = _s.heroLead; }    if(_s.aboutText) { var at = document.querySelector('#about .sec-head p'); if(at) at.textContent = _s.aboutText; }  });}`;

code = code.replace(faultyBlock, fixedBlock);
fs.writeFileSync('index.html', code);
