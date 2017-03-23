//$(function () {
odoo.define('project_wbs.project_wbs', function (require) {

'use strict';
var Model = require('web.DataModel');
var ajax = require('web.ajax');
var config = require('web.config');
var Widget = require('web.Widget');
var website = require('website.website');
var id_generic = parseInt($('#project_id').text());
var treeGlobal = [];

  function scan(id, callback){
    var Projects = new Model('project.project');

    var project_id = id;
    var projects = null;
    var project_name = 'N/A';

    Projects.query(['id','name','child_ids'])
         .filter([['id', '=', project_id ]])
           .all().then(function (project_data) {
          _.each(project_data, function(project_data) {
          project_id = project_data.id;
          project_name = project_data.name;
          if (!project_data.child_ids) {
            projects = {"name": project_data.name, "children": null};
            }
          else {
            var children = [];
            var u = 0;

            for (var i = 0; i < project_data.child_ids.length; i++) {
              Projects.query(['name'])
                .filter([['id','=',project_data.child_ids[i]]])
                .all().then(function (child_data) {
                  children[u] = {"name": child_data[0].name, "parent": project_data.name};

                  scan(child_data[0].id, function(p){
                    getValue(p);
                  });

                  function getValue(p){
                    var index = children.findIndex(x => x.name==p.name);
                    children[index] = p;
                  }

                  u++;

                  if(u === project_data.child_ids.length){
                    projects = {"name": project_data.name, "children": children};
                    callback(projects);
                  }
                });
              }

            }
        });
      });
  }

  scan(id_generic, function(tree){
    update(root = tree);
  });

  // *********************************************************
  var margin = {top: 20, right: 120, bottom: 20, left: 120},
  	width = 960 - margin.right - margin.left,
  	height = 500 - margin.top - margin.bottom;

  var i = 0,
  	duration = 750,
  	root;

  var tree = d3.layout.tree()
  	.size([height, width]);

  var diagonal = d3.svg.diagonal()
  	.projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select(".projects").append("svg")
  	.attr("width", width + margin.right + margin.left)
  	.attr("height", height + margin.top + margin.bottom)
    .append("g")
  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root.x0 = height / 2;
  root.y0 = 0;

  d3.select(self.frameElement).style("height", "500px");

  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
  	  links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
  	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
  	  .attr("class", "node")
  	  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
  	  .on("click", click);

    nodeEnter.append("rect")
      .attr("width", 5)
      .attr("height", 5)
      .attr("y", 0)
      .attr("x", 0)
  	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
  	  .attr("x", function(d) { return d.children || d._children ? 0 : 0; })
  	  .attr("dy", ".35em")
  	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  	  .text(function(d) { return d.name; })
  	  .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
  	  .duration(duration)
  	  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("rect")
      .attr("width", 80)
      .attr("height", 60)
      .attr("y", -30)
      .attr("x", -80)
      //.attr("x", function(d) { return d.children || d._children ? -80 : 0; })
  	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
      .attr("x", function(d) { return d.children || d._children ? -40 : -40; })
      .style("text-anchor", "middle")
  	  .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
  	  .duration(duration)
  	  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
  	  .remove();

    nodeExit.select("rect")
    .attr("y", 0)
    .attr("x", 0)
    .attr("width", 5)
    .attr("height", 5);

    nodeExit.select("text")
  	  .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
  	  .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
  	  .attr("class", "link")
  	  .attr("d", function(d) {
  		var o = {x: source.x0, y: source.y0};
  		return diagonal({source: o, target: o});
  	  });

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

/*
var Model = require('web.DataModel');
var ajax = require('web.ajax');
var config = require('web.config');
var Widget = require('web.Widget');
var website = require('website.website');

var Projects = new Model('project.project');

var project_id = parseInt($('#project_id').text());
var projects = null;
var project_name = 'N/A';
console.log('Antes de consultar odoo');
Projects.query(['id','name','child_ids'])
     .filter([['id', '=', project_id ]])
	     .all().then(function (project_data) {
			_.each(project_data, function(project_data) {
			project_id = project_data.id;
			project_name = project_data.name;
			if (!project_data.child_ids) {
				projects = {"name": project_data.name, "children": null};
				}
			else {
				console.log('Child ids');
				console.log(project_data.child_ids[0]);
				Projects.query(['name'])
					.filter([['id','=',project_data.child_ids[0]]])
					.all().then(function (child_data) {
						projects = {"name": project_data.name, "children": [{"name": child_data[0].name, "children": null}]};
						console.log('Projects');
						console.log(projects);
						  update(root = projects);
						});
				}
			// do work with users records
		});
	});

// var get_children = function (project_id, project_name) {
//function get_children(project_id, project_name) {
//	Projects.query(['name','parent_id']).
//		filter([['parent_id', '=', project_id]]).count().then(function (item) {
//			console.log('Cantidad');
//			console.log(item);
//			if (item > 0) {
//				Projects.query(['name','parent_id'])
//					.filter([['parent_id', '=', project_id]])
//					.all().then(function (project_data) {
//						_.each(project_data, function(project_data) {
//							project_id = project_data.id;
//							project_name = project_data.name;
//							children = get_children(project_id,project_name);
//						}); //each
//					});
//				} // end item > 0
//			else {
//				// var return_value = [{'name': project_name, children: null}];
//				var return_value = [{'name': 'ABC', children: null}];
//				// return project_name;
//				console.log('Retorno');
//				console.log(return_value);
//				return return_value;
//				}
//			}); // end count.then
//	}; // end function get_children

// console.log(get_children(project_id));
//children = get_children(project_id);
//console.log('After function');
//console.log(children);
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
}*/

});
