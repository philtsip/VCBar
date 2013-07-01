/*!
*   VC Bar Chart
*   Creates a bar chart of VC investments by date
*   using Crunchbase data.
*
*   Graphite compressed into diamond-like code
*   through sheer strength by Jerry Neumann, 2011, 2012.
*
*   No copyright. But if you use the code, show me some link love
*   at neuvc.com or reactionwheel.blogspot.com and
*   follow me at @ganeumann
*
*   Updated: 06/30/13 -- Philipp Tsipman
*/

var crunchbaseAPIkey = "";  // ADD YOUR OWN KEY

var today = new Date(),
	byear = 2005,
	eyear = today.getFullYear(),
	months = (eyear - byear +1) * 12,
	thismonth = months+today.getMonth()-12,
	totw = 960,
	w = Math.floor(totw / months),
	h = 175,
	vcf;	

for (var years=[],i=byear;i<=eyear;i++) {years.push(i)};

var getdata = function(vclist,rnddict) {
	var dat = [], i, j, idx, vctxs, nm, alreadyfunded, monthcos, afx;
	for (i=0; i < months; i+=1) {
		dat[i] = {'num':0, 'new':0, 'names':'', 'newnames':''};
	};
	// have to order investments by date
	for (i=0;i<vclist.length;i+=1) {
		alreadyfunded=[];
		vctxs=vcf[vclist[i]];
		for (j=0;j<vctxs.length;j+=1) {
			idx = vctxs[j][2];
			nm = vctxs[j][0];
			afx = alreadyfunded.indexOf(nm)==-1;
			if (afx) { alreadyfunded.push(nm); };
			if (rnddict[vctxs[j][1]]) {
				if (dat[idx]['names'].indexOf(nm) == -1 && dat[idx]['newnames'].indexOf(nm) == -1) {
					dat[idx]['num'] += 1;
					if (afx) {
						dat[idx]['new']+=1;
						dat[idx]['newnames'] += nm+", ";
					} else {dat[idx]['names'] += nm+", ";};
				};
			};
		};
	};
	return dat
};

var bchart = function (data) {
	$(".chart").remove();

	var running=0, tavg=[];

	for (var lgst=0, i=0;i<data.length;i++) {
		if (data[i]['num'] > lgst) { lgst = data[i]['num'] };
		if (i<12) {
			running += data[i]['num'];
		} else {
			running = running - data[i-12]['num'] + data[i]['num'];
			tavg[i]=running/12;
		};
	};

	var tks = Math.min(lgst,5);

	var x = d3.scale.linear()
		.domain([0,1])
		.range([0,w]);

	var y = d3.scale.linear()
		.domain([0,lgst])
		.range([0,h]);
		
	var chart = d3.select("#barchart")
		.append("svg:svg")
			.attr("class","chart")
			.attr("width", totw+40)
			.attr("height", h+40)
		.append("svg:g")
			.attr("transform","translate(20,15)");

	chart.selectAll("line.hrule")
			.data(y.ticks(tks))
		.enter().append("svg:line")
			.attr("class","hrule")
			.attr("x1",0)
			.attr("x2",totw)
			.attr("y1",function(d) { return h-y(d); })
			.attr("y2",function(d) { return h-y(d); })
			.attr("stroke","#ccc");
	
	chart.selectAll("text.hrule")
			.data(y.ticks(tks))
		.enter().append("svg:text")
			.attr("class","hrule")
			.attr("x",0)
			.attr("y",function(d) { return h-y(d); })
			.attr("dx",-1)
			.attr("text-anchor","end")
			.text(String);
	
	var barsb = chart.selectAll("rect")
			.data(data).enter(),
		bars1=barsb.append("svg:rect")
			.attr("class","allbar")
			.attr("x", function(d, i) { return x(i) - .5; })
			.attr("y", function(d) { return h - y(d.num) - .5; })
			.attr("width",w)
			.attr("height", function(d) { return y(d.num); }),
		bars2=barsb.append("svg:rect")
			.attr("class","newbar")
			.attr("x", function(d, i) { return x(i) - .5; })
			.attr("y", function(d) { return h - y(d.new) - .5; })
			.attr("width",w)
			.attr("height", function(d) { return y(d.new); })
	
	bars1.append("svg:title")
			.text(function(d) { return d.names.slice(0,-2); });
	bars2.append("svg:title")
			.text(function(d) { return d.newnames.slice(0,-2); });

	chart.selectAll("line.vrule")
			.data(years)
		.enter().append("svg:line")
			.attr("class","vrule")
			.attr("y1",h+10)
			.attr("y2",0)
			.attr("x1",function(d) { return (d-byear)*w*12 - .5; })
			.attr("x2",function(d) { return (d-byear)*w*12 - .5; })
			.attr("stroke","#ccc");
			
	chart.selectAll("text.vrule")
			.data(years)
		.enter().append("svg:text")
			.attr("class","vrule")
			.attr("y",h)
			.attr("x",function(d) { return (d-byear) * w * 12 + w * 6; })
			.attr("dy",10)
			.attr("text-anchor","middle")
			.text(String);	

	chart.append("svg:line")
		.attr("x1",0)
		.attr("y1",h-.5)
		.attr("x2",totw)
		.attr("y2",h-.5)
		.attr("stroke","#000");
				
	chart.append("svg:line")
		.attr("x1",0)
		.attr("y1",h-.5)
		.attr("x2",0)
		.attr("y2",.5)
		.attr("stroke","#000");
		
	if (lgst>0) {
		for (var i=13;i<thismonth;i++) {
			chart.append("svg:line")
				.attr("x1",x(i-1)+w/2)
				.attr("y1",h-y(tavg[i-1]))
				.attr("x2",x(i)+w/2)
				.attr("y2",h-y(tavg[i]))
				.attr("stroke","#F60")
				.attr("stroke-width",1.1);
		};
	};
			
	return chart		
};

var keys = function(arr) {
	var key = []
	for (var i in arr) {
		key.push(i);
	};
	return key;
};

var remove = function(arr,elem) {
	var idx = arr.indexOf(elem);
	if (idx != -1) {
		arr.splice(idx,1);
	};
	return arr;
};

var goDo = function(vclist,rndlist) {
	var data = getdata(vclist,rndlist);
	return bchart(data);
};

var sortList = function(a,b) {
	// sort  a=[name,round,idx], b=[name,round,idx] by idx
	var a2 = a[2],
		b2 = b[2];
	if (a2<b2) return -1;
	if (a2==b2) return 0;
	return 1;
};

$(document).ready(function () {
	
	var parseCB = function(jsn) {
		var invs = [], yr, mo;
		var vc = jsn["permalink"];
		if (jsn["crunchbase_url"][26]=="c") {vc = "-"+vc;};
		if ("investments" in jsn) {
			for (var i in jsn["investments"]) {
				var j = jsn["investments"][i];
				if ("funding_round" in j) {
					yr = j["funding_round"]["funded_year"];
					mo = j["funding_round"]["funded_month"];
					if (!mo || (mo == "None")) { continue };
					if (!yr) { continue };
					idx = (parseInt(yr)-byear) * 12 + parseInt(mo) - 1;
					if (idx < 0) { continue };
					var list = [j["funding_round"]["company"]["name"],
								j["funding_round"]["round_code"],	
								idx];
					invs.push(list);
				};
			};
		};
		vcf[vc] = invs.sort(sortList);
		vclist.push(vc);
		$("#"+vc).addClass("red");
		return goDo(vclist,rnds);
	};
	
	var vclist = [],
		rnds = {'seed': true,
				 'angel': true,
				 'a': true,
				 'b': true,
				 'c': true,
				 'd': true,
				 'e': true,
				 'f': true,
				 'debt_round': true,
				 'unattributed': true};
	
	var lightUp = function(vnms) {
		vclist = [];
		$(".vc").removeClass("red");
		for (i in vnms) {
			if (vcs.indexOf(vnms[i]) != -1) {
				if (!(vnms[i] in vcf)) {
					if (vnms[i][0] != "-") {
						$.getJSON("http://api.crunchbase.com/v/1/financial-organization/"+vnms[i]+".js?api_key="+crunchbaseAPIkey+"&callback=?",parseCB); } else {
						$.getJSON("http://api.crunchbase.com/v/1/company/"+vnms[i].slice(1,vnms[i].length)+".js?api_key="+crunchbaseAPIkey+"&callback=?",parseCB); }
				} else {
					vclist.push(vnms[i]);
					$("#"+vnms[i]).addClass("red");
				};
			};
		};
		return goDo(vclist,rnds);
	};
				
	
	$("#all").click(function () {
		lightUp(vcs);
	});

	$("#none").click(function () {
		lightUp([]);
	});

	$("#super-angels").click(function () {
		lightUp(['500-startups','floodgate','felicis-ventures','founder-collective',
				'softtech-vc','sv-angel','founders-co-op','thrive-capital','founders-fund',
				'harrison-metal-capital','lerer-ventures','lowercase-capital','baseline-ventures',
				'first-round-capital','rose-tech-ventures']);
	});

	$("#nyc").click(function () {
		lightUp(['bessemer-venture-partners','union-square-ventures','elevation-partners',
			'insight-venture-partners','rho-capital-ventures','contour-venture','ascend-venture-group',
			'rre-ventures','greenhill-savp','hudson-ventures','starvest-partners','greycroft-partners',
			'softbank-capital','apax-partners','venrock','constellation-ventures','boldstart-ventures',
			'ia-venture-strategies','-betaworks','metamorphic-ventures-llc','lerer-ventures','nyc-seed',
			'founder-collective','village-ventures','first-round-capital','firstmark-capital','zelkova-ventures',
			'crossbar-capital','rose-tech-ventures','dfj-gotham-ventures','great-oaks-venture-capital','neu','kbs-p-ventures']);
	});

	$("#old-school").click(function () {
		lightUp(['bessemer-venture-partners','norwest-venture-partners','greylock','morganthaler-ventures-2',
				'mayfield-fund','charles-river-ventures','fidelity-ventures','kleiner-perkins-caufield-byers','sequoia-capital',
				'soffinova','menlo-ventures','matrix-partners','new-enterprise-associates','oak-investment-partners',
				'sutter-hill-ventures','venrock']);
	});

	$("#smart-money").click(function () {
		lightUp(['accel-partners','sequoia-capital','greylock','benchmark-capital',
				'new-enterprise-associates','founders-fund','andreesen-horowitz',
				'union-square-ventures','sv-angel','kleiner-perkins-caufield-byers',
				'venrock','floodgate','first-round-capital','redpoint-ventures',
				'bessemer-venture-partners']);
	});

	$("#sand-hill-road").click(function () {
		lightUp(['draper-fisher-jurvetson','greylock','azure-capital-partners','lightspeed-venture-partners',
				'highland-capital-partners','shasta-ventures','kleiner-perkins-caufield-byers','sequoia-capital',
				'storm-ventures','benchmark-capital','us-venture-partners','new-enterprise-associates',
				'andreesen-horowitz','charles-river-ventures','battery-ventures','redpoint-ventures',
				'tenaya-capital','versant-ventures','morganthaler-ventures-2']);
	});
	
	$("#make-link").click(function () {
		var roundsURLpc = ""
		$("#mlText").removeAttr("value");
		for (var i in rnds) {
			if (rnds[i]) { roundsURLpc += i+"+"; };
		};
		$("#mlText").attr("value",window.location+"?vcs="+vclist.join("+")+"&rounds="+roundsURLpc.slice(0,-1));
		$("#makeLink").show();
		return;
	});
	
	$("#mlClose").click(function() { $("#makeLink").hide(); });
				 
	$.each(vcs,function(idx,vlu) {
		$("#vcs").append("<div class='vc' id='"+vlu+"'>"+vlu+"</div>"); });
		
	$(".vc").click(function() {
		var vc = $(this).text();
		if (!$(this).hasClass("red")) {
			if (!(vc in vcf)) {
				if (vc[0] != "-") {
						$.getJSON("http://api.crunchbase.com/v/1/financial-organization/"+vc+".js?api_key="+crunchbaseAPIkey+"&callback=?",parseCB); } else {
						$.getJSON("http://api.crunchbase.com/v/1/company/"+vc.slice(1,vc.length)+".js?api_key="+crunchbaseAPIkey+"&callback=?",parseCB); };
				return;
			} else {
				vclist.push(vc);
				$(this).addClass("red");
			};
		} else {
			vclist = remove(vclist,vc);
			$(this).removeClass("red");
		};
		return goDo(vclist,rnds);
	});
	
	$(":checkbox").click(function() {
		$(":checkbox").each(function(idx,elem) {
			var k = $(elem).attr("value");
			if ($(elem).is(":checked")) {
				rnds[k] = true;				
			} else {
				rnds[k] = false;
			};
			return goDo(vclist,rnds);
		});
	});
	
	q=location.search;
	var setClick = "";
	if (q.length>1) {
		var q2 = q.substr(1).split("&");
		for (var q3 in q2) {
			var q4 = q2[q3].split("=");
			if (q4[0] == "vcs") {
				lightUp(q4[1].split("+"));
			} else if (q4[0] == "rounds") {
				var q5 = q4[1].split("+");
				for (i in rnds) {
					if (q5.indexOf(i) == -1) {
						rnds[i] = false;
						$("#"+i).attr("checked",false);
					};
				};
			} else if (q4[0] == "scen") {
				if (['all','smart-money','super-angels','old-school','nyc','sand-hill-road'].indexOf(q4[1]) != -1) {
					setClick = q4[1];
				};
			};
		};
	if (setClick) { $("#"+setClick).click(); };
	};
	
	var chart = d3.select("#barchart")
		.append("svg:svg")
			.attr("class","chart")
			.attr("width", 1000)
			.attr("height", 215);
	chart.append("svg:line")
			.attr("x1",15)
			.attr("y1",190-.5)
			.attr("x2",975)
			.attr("y2",190-.5)
			.attr("stroke","#000");
	chart.append("svg:line")
			.attr("x1",15)
			.attr("y1",190-.5)
			.attr("x2",15)
			.attr("y2",15.5)
			.attr("stroke","#000");
	chart.append("svg:text")
			.attr("x",500)
			.attr("y",100)
			.attr("text-anchor","middle")
			.attr("font-size","12px")
			.text("Click on a firm (or firms) below to see their investments, as per Crunchbase.");
});