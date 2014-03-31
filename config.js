Wat.init({
    'default': {
	'host': 'http://graphite.example.com',
	'bgcolor': "fefefe",
	'fgcolor': "000000",
	'width': 550,
	'height': 300,
	'colorize': true
    },
    'graphs': [
	{ 
	    'title': "Some Requests",
	    'tags': [ "requests" ],
	    'target': function(bucket) { return [
		G.alias(G.summarize("stats_counts.srv.alt_fetch.request", bucket, "sum"), "Requests"),
		G.alias(G.summarize("stats_counts.srv.something", bucket, "sum"), "Something Else")
	    ] }
	}, {
	    'title': "Things Requested / Hit",
  	    'tags': [ "requests", "things" ],
	    'target': function(bucket) {
		return G.alias(G.summarize("divideSeries(stats_counts.srv.things.count, stats_counts.srv.all.request)", bucket, "avg"), "Things Requested")
	    }
	}, {
	    'title': "Hits / Site",
	    'tags': [ "requests", "site" ],
	    'colorize': false,
	    'target': function(bucket) { return [
		G.highestMax(G.aliasByNode(G.summarize("stats_counts.srv.tracker.*.request", bucket, "sum"), 3), 7)
	    ] }
	}	
    ]
});