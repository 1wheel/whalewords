var xWidth = Math.max(window.innerWidth - 150, 700);

$('#title').css('margin-left', xWidth - 50 - $('#title').width() - $('#inputspan').width());

var barWidth = 2;
var numBars = Math.floor(xWidth/2);

var margin = {top: 20, right: 0, bottom: 20, left: 70},
	width = numBars*barWidth + margin.left + margin.right,
	height = Math.max(window.innerHeight - margin.top - margin.bottom - 400, 400);

var y = d3.scale.linear()
		.range([height, 0]);

var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(d3.format("d"));

var svg = d3.select("#graph").append("svg")
		.attr("id", "svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr("id", "transformBox")

var tooltip = d3.select("body")
		.append("div")
		.attr("id","tooltip");

//loads unemployment data in rawdata and attaches a date object 
var book;
d3.json("mobydick.json", function(error, input) {
	book = input;
	book.ltext = book.text.toLowerCase();

	//0s out data array
	resetData();

	svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
		.append("text")
			.attr("transform", "translate("+ (-80/2) +","+(height/2)+")rotate(-90)")
			.style("text-anchor", "middle")
			.text("Frequency (per 400 words)");

	//draws histogram bars
	svg.selectAll('.bar')
		.data(data)
	.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d, i){return (1+i)*barWidth;})
		.attr("width", barWidth)
		.attr("y", height)
		.attr("height", 0)
		.on("mouseover", function(){

			var cord = d3.mouse(this);
			console.log(cord);
			var position = findIndex(Math.floor(cord[0]/barWidth), Math.floor(y.invert(cord[1])));
			d3.select(this).style("fill", "#435A82");
			document.getElementById("context").innerHTML = indexText(indices[position]).replace(new RegExp('(' + word  + ')', 'gi'), "<b>$1</b>").replace(/\n\r?/g, '<br />');

			// var cord = d3.mouse(this);
			// position = findIndex(Math.floor(cord[0]/numBars), Math.floor(y.invert(cord[1])));
			// d3.select(this).style("fill", "#435A82");
			// //console.log(position);
			// if (position > -1){
			// 	document.getElementById("context").innerHTML = indexText(indices[position]).replace(new RegExp('(' + word  + ')', 'gi'), "<b>$1</b>").replace(/\n\r?/g, '<br />');
			// }
		})
		.on("mousemove", function(){			
			// var cord = (typeof event === 'undefined') ? ffm : [event.pageX, event.pageY];
			// xOffset = ((cord[0] - 150) > width/2) ? -10 - document.getElementById("tooltip").offsetWidth : 10;
			// tooltip.style("top", (cord[1]-10)+"px").style("left",(cord[0]+xOffset)+"px");
			// console.log("s xat " + cord[0] + " win at " + window.innerWidth + " tt " + $('#tooltip').width())
			// if ((xOffset == 10) && window.innerWidth - cord[0] - $('#tooltip').width() < 0){
			// 	console.log("s xat " + cord[0] + " win at " + window.innerWidth + " tt " + $('#tooltip').width())
			// 	document.getElementById("tooltip").innerHTML = document.getElementById("tooltip").innerHTML.replace('<br>', ' ');
			// }
		})
		.on("mouseout", function (){
			d3.select(this).style("fill", "");
		});

	book.chapterStarts[book.chapterStarts.length] = book.text.length;

	//draws chapter bars
	var scaleFactor = numBars*barWidth/book.text.length;
	for (var i = 0; i < book.chapterTitles.length; i++){
		var title = book.chapterTitles[i];
		svg.append("rect")
			.attr("class", "chapter " + (i%2 ? 'light' : 'dark'))
			.attr("x", book.chapterStarts[i]*scaleFactor + barWidth)
			.attr("height", 7)
			.attr("width", (book.chapterStarts[i+1] - book.chapterStarts[i])*scaleFactor)
			.attr("y", height)
			.attr("titleOfChapter", title)
			.on('mouseover', function(){
				var cord = (typeof event === 'undefined') ? ffm : [event.pageX, event.pageY];
				tooltip.style("top", (cord[1]-10)+"px").style("left",(cord[0]+10)+"px");
				tooltip.style("visibility", "visible");
				tooltip.text(d3.select(this)[0][0].attributes[5].nodeValue);
				d3.select(this).style("fill", "#422813");
			})
			.on("mousemove", function(e){
				var cord = (typeof event === 'undefined') ? ffm : [event.pageX, event.pageY];
				tooltip.style("top", (cord[1]-10)+"px").style("left",(cord[0]+10)+"px");
			})
			.on("mouseout", function (){
				tooltip.style("visibility", "hidden");
				d3.select(this).style("fill","");
			});

	}
});

//given x and y value from graph, finds index
function findIndex(x, y){
	if (y + 1){
		var sum = 0;
		for (var i = 0; i < x - 2; i++){
			sum = sum + data[i];
		}
		return (sum + y);
	}
	else return -1;
}

//returns text surrounding position in book
function indexText(index){
	var start = Math.max(index - 300, 0);
	while (book.text[start] != "\n"){
		start = start + 1;
	}
	var end = Math.min(index + 300, book.text.length - 1);
	while (book.text[end] != "\n"){
		end = end - 1;
	}
	return book.text.substring(start + 1, end);
}

var data = [];
var indices = [];
var word;

function updateGraph(match){
	updateData(match);

	y.domain([0, d3.max(data)]);
	svg.select(".y.axis").call(yAxis);
	
	svg.selectAll('.bar')
			.data(data)
		.transition()
			.duration(1000)
			.attr("y", function(d){return y(d)})
			.attr("height", function(d){return height - y(d);});			
};

function updateData(match){
	resetData();
	indices = indexOfArray(match);
	for (var i = 0; i < indices.length; i++){
		var index = Math.floor(numBars*indices[i]/book.text.length);
		data[index] = data[index] + 1;
	}
}

function resetData(){
	for (var i = 0; i < numBars; i++){
		data[i] = 0;
	}
}

function indexOfArray(match) {
	match = match.toLowerCase();
	var indices = [];
	var index = 0;
	index = book.ltext.indexOf(match, index);
	while(index > 0) {
		indices.push(index);
		index = book.ltext.indexOf(match, index + 1);
	}
	return indices;
}

//firefox doesn't capture mousemove propertly
var ffm;
function onMouseMove(e){
	ffm = [e.clientX, e.clientY];
}
document.addEventListener('mousemove', onMouseMove, false);


function updateWord(){
	word = $("#autocomplete").val();
	if (word.length > 0){
		updateGraph(word);
		d3.select("#wordText").text(word);
		d3.select("#title").style("visibility", "visible");
	}
	else{
		d3.select("#title").style("visibility", "hidden");
	}
}

$('#autocomplete').keyup(function(e){
	if(e.keyCode == 13)
	{
		updateWord();
		$(this).autocomplete("close");
	}
});


$( "#autocomplete" ).autocomplete({
	minLength: 0,
	select: function( event, ui ) {
		updateWord();
	},
	source: function( request, response ) {
		str = request.term.toLowerCase();
		var count = 0;
		var n = 0;
		var matches = [];
		var matchValues = [];
		while(n < book.fKeys.length && count < 10){
			if (str === book.fKeys[n].substring(0,str.length)){
				count = count + 1;
				matches.push({	value: book.fKeys[n],
				 				number: book.fValues[n], 
				 				bold: str, 
				 				nbold: book.fKeys[n].substring(str.length, book.fKeys[n].length)});
			}
			n = n + 1;
		}		
		response(matches);
	}
}).data('ui-autocomplete')._renderItem = function(ul, item){
		return $( "<li>" )
        	.append( "<a class = 'dropDown'><strong>" + item.bold + "</strong>" + item.nbold + " " + item.number + "</a>" )
        	.appendTo( ul );
	};