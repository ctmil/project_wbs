//$(function () {
odoo.define('project_wbs.project_wbs', function (require) {
'use strict';

var Model = require('web.DataModel');
var ajax = require('web.ajax');
var config = require('web.config');
var Widget = require('web.Widget');
var website = require('website.website');

var Projects = new Model('project.project');

var project_id = parseInt($('#project_id').text());
var projects = null;
var project_name = 'N/A';
Projects.query(['name'])
     .filter([['id', '=', project_id ]])
	     .all().then(function (project_data) {
			projects = {"name": project_data[0].name, "children": null};
			project_name = project_data[0].name;
			// do work with users records
		});

var children = null;
var get_children = function (project_id, project_name) {
	if Projects.query(['name','parent_id'])
		.filter([['parent_id', '=', project_id]]).count() > 0 {
		Projects.query(['name','parent_id'])
			.filter([['parent_id', '=', project_id]])
			.all().then(function (project_data) {
				_.each(project_data, function(project_data) {
					console.log('Dentro #2');
					console.log(project_data.id);
					project_id = project_data.id;
					project_name = project_data.name;
					children = get_children(project_id,project_name);
					});
				});
		} else {
			console.log('Proyecto hijo');
			console.log(project_name);
			return project_name;
		}
	};

console.log(get_children(project_id));

//var svgContainer = d3.select(".projects").append("svg").attr("width", 200).attr("height", 200);
//var rectangle = svgContainer.append("rect").attr("x", 10).attr("y", 10).attr("width", 50).attr("height", 100);


var margin = {top: 30, right: 20, bottom: 30, left: 20},
    width = 960 - margin.left - margin.right,
    barHeight = 20,
    barWidth = width * .8;

var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 20]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select(".projects").append("svg")
    .attr("width", width + margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("/project_wbs/static/src/js/flare.json", function(error, flare) {
// d3.json("/project/8/json", function(error, flare) {
  if (error) throw error;
  // flare = {name: "Proyecto 1", children: Array[10], x0: 0, y0: 0, depth: 0…}
  //flare = {name: "Proyecto 1", children: [], x0: 0, y0: 0}
  flare.x0 = 0;
  flare.y0 = 0;
  update(root = projects);
  // update(root = flare);
  console.log(flare);
  console.log('Cargo sin problemas');
});

function update(source) {

  // Compute the flattened node list. TODO use d3.layout.hierarchy.
  // console.log('Entro a update');
  var nodes = tree.nodes(root);

  var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

  d3.select("svg").transition()
      .duration(duration)
      .attr("height", height);

  d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  nodeEnter.append("rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", barWidth)
      .style("fill", color)
      .on("click", click);

  nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) { return d.name; });

  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", color);

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}


});

