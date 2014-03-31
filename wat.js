var Wat = {
    config: null,
    tags: null,
    init: function(config) {
	var _this = this;
	$(document).keypress(function(event) { if(event.which == 114) _this.render(); });
	this.config = config;
	$(function() { _this.render(); });
    },
    pathParts: function() {
	var parts = window.location.hash.substring(1).split("/");
	if(parts.length < 3)
            parts = [ 'all', '-1day', '-' ];
	return parts;
    },
    render: function() {
	var parts = this.pathParts(), shouldshow = false, _this = this, tag = null, inittags = (this.tags == null);
	this.showTag(parts[0]);
	this.showWhen(parts[1]);
	$("#graphs").empty();
	if(inittags) this.tags = {}
	$.each(this.config.graphs, function(_, graph) {
	    shouldshow = false;
	    $.each(graph.tags, function(_, tag) {
		if(inittags) {
		    if(!(tag in _this.tags))
			_this.tags[tag] = 0;
		    _this.tags[tag] += 1;
		}
		if(parts[0] == tag || parts[0] == "all") shouldshow = true;
	    });
	    if(shouldshow) {
		gconf = { 'from': parts[1], 'until': parts[2] }
		for(name in _this.config.default)
		    gconf[name] = _this.config.default[name];
		for(name in graph)
		    gconf[name] = graph[name];
		_this.makeGraph(gconf, graph.tags);
	    }
	});
	$("#taglist").empty();
	$("#taglist").append("<li><a href='#' onclick='Wat.showTag(\"all\"); Wat.render(); return false;'>all <span class='badge'>" + this.config.graphs.length + "</span></a></li>");
	for(tag in this.tags)
	    $("#taglist").append("<li><a href='#' onclick='Wat.showTag(\"" + tag + "\"); Wat.render(); return false;'>" + tag + " <span class='badge'>" + this.tags[tag] + "</span></a></li>");
	$("#buckets").html("<span class='glyphicon glyphicon-time'></span> buckets are by " + this.getBucket());
    },
    getBucket: function() {
	var bucket = "1day";
	switch(Wat.pathParts()[1].substring(2)) {
	case 'day':
	    bucket = '10min';
	    break;
	case 'hour':
	    bucket = '30sec';
	    break;
	case 'week':
	    bucket = '1hour';
	    break;
	case 'month':
	    bucket = '12hours';
	    break;
	}
	return bucket;
    },
    showWhen: function(when) {
	var parts = this.pathParts();
	parts[1] = when;
	window.location.hash = "#" + parts.join('/');
	$("li.active").removeClass("active");
	$("#range" + when.substring(2)).addClass('active');
    },
    showTag: function(tag) {
	var parts = this.pathParts();
	parts[0] = tag;
	window.location.hash = "#" + parts.join('/');
	$("#tagdropdown").html(tag + ' <b class="caret"></b>');
    },
    showDetails: function(url, title) {
	var img = $("<img/>");
	img.attr('src', url);
	$("h4#myLargeModalLabel").html(title);
	$("#details div.modal-body").empty().append(img);
	$("#details").modal();
    },
    makeUrl: function(params) {
	var query = [], targets = params.target, _this = this;

	switch(typeof params.target) {
	case 'function':
	    targets = params.target(this.getBucket());
	    if(typeof targets == 'string') targets = [ targets ];
	    break;
	case 'string':
	    targets = [ params.target ];
	    break;
	}

	query = $.map(targets, function(target, i) {
	    target = params.colorize ? _this.colorize(target, i) : target;
	    return "target=" + encodeURIComponent(target);
	});
	for(name in params)
	    if(name != "target")
		query.push(name + "=" + encodeURIComponent(params[name]));

	query.push("_unique=" + parseInt((new Date().getTime()) / 10000, 10));
	return params.host + "/render?" + query.join("&");
    },
    makeGraph: function(params, tags) {
	var img = $("<img/>"), div = $("<div class='col-md-6 graph'/>"), tdiv = $("<div class='tags'/>");
	img.attr('src', this.makeUrl(params));
	img.load(function() { $(this).parent().parent().children('span').hide(); });
	params.height = 500;
	params.width = 850;
	div.append($('<a href="#" onclick="Wat.showDetails(\'' + this.makeUrl(params) + '\', \'' + params.title + '\'); return false;" class="thumbnail" />').append(img));
	tdiv.html("<span class='glyphicon glyphicon-tags'></span> " + $.map(tags, function(tag) {
	    return "<a href='#' onclick='Wat.showTag($(this).text()); Wat.render(); return false;'>" + tag + "</a>";
	}).join(", "));
	div.append('<span class="loading glyphicon glyphicon-stats"></span>');
	div.append(tdiv);
	div.appendTo($("#graphs"));
    },
    colorize: function(s, i) {
	var colors = "1f77b4 ff7f0e 2ca02c d62728 9467bd 8c564b e377c2 7f7f7f bcbd22 17becf".split(" ");
	return G.color(s, colors[i]);
    }
};

var G = {};
$.each("highestMax aliasByNode threshold summarize color alias".split(" "), function(_, name) { 
    G[name] = function() {
	return name + "(" + $.map(arguments, function(a, i) {
	    return (typeof a == 'number' || i == 0) ? a : ('"' + a + '"');
	}).join(",") + ")";
    };
});
