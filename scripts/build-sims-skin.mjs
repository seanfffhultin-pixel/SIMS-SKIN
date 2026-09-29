import {readFileSync, writeFileSync} from 'node:fs';
import postcss from 'postcss';
const cssPath = new URL('../public/sims-skin/shsb-sims.css', import.meta.url);
const marker = '/* Generated mobile layout */';
const base = readFileSync(cssPath, 'utf8').split(marker)[0].trimEnd();
const mobile = postcss.parse(readFileSync(new URL('../skin/mobile.css', import.meta.url), 'utf8'));
const scope = 'body[ng-app="studentApp"][ng-controller="IndexCtrl"]';
mobile.walkRules(rule => { rule.selectors = rule.selectors.map(selector => selector === '&' ? scope : scope + ' ' + selector); });
mobile.walkDecls(decl => { decl.important = true; });
const css = base + '\n\n' + marker + '\n' + mobile.toString();
writeFileSync(cssPath, css);
const logic = readFileSync(new URL('../skin/homework.js', import.meta.url), 'utf8');
const header = `// ==UserScript==
// @name         SHSB SIMS Skin + Personal Homework Ticks
// @namespace    shsb-personal-sims-skin
// @version      0.5.0
// @description  A lighter SIMS Student interface and private browser-local homework ticks.
// @match        https://www.sims-student.co.uk/*
// @run-at       document-idle
// @grant        none
// @inject-into  page
// @sandbox      raw
// @noframes
// ==/UserScript==
`;
writeFileSync(new URL('../public/sims-skin/shsb-sims.user.js', import.meta.url), header + `\n(() => {\n'use strict';\nif (location.hostname !== 'www.sims-student.co.uk') return;\nif (!document.getElementById('shsb-skin-css')) {\nconst style = document.createElement('style');\nstyle.id = 'shsb-skin-css';\nstyle.textContent = ${JSON.stringify(css)};\ndocument.head.append(style);\n}\n${logic}\nstartSimsSkin(window, document);\n})();\n`);
console.log('Built standalone userscript with embedded CSS.');
