//$(function () {
odoo.define('project_wbs.project_wbs', function (require) {
'use strict';

var ajax = require('web.ajax');
var config = require('web.config');
var Widget = require('web.Widget');
var website = require('website.website');

console.log('Hola mundo');

var svgContainer = d3.select("body").append("svg").attr("width", 200).attr("height", 200);
var rectangle = svgContainer.append("rect").attr("x", 10).attr("y", 10).attr("width", 50).attr("height", 100);

});

