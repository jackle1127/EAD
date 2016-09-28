google.charts.load('current', {'packages':['controls', 'corechart', 'table']});
google.charts.setOnLoadCallback(loadCountryNames);
var mainSheetId = '1NGPqvcH7wkpWf84EpJE3RRoNvShXli_SDk6P3XZA1mY';
var seriesInfoSheetId = '1xWm4ePMJRWQtJ0iufRtSTMk0FpW1xc3Dt7pyuTjzoF4';
var rawDataTable; // Global Google datatable object
var table;
var chart;
var seriesInformation, currentCountry;

function loadChartData() {
	document.getElementById("questionWording").innerText = "";
	function getFullSeriesName(abbreviation) {
		if (seriesInformation != null
				&& seriesInformation[currentCountry] != null
				&& seriesInformation[currentCountry][abbreviation] != null) {
			return seriesInformation[currentCountry][abbreviation]['description'];
		} else {
			return abbreviation;
		}
	}
	function resetSlider(slider) {
		slider.setState({
			range: {
				start: new Date("1000-01-01"),
				end: new Date("3000-01-01")
			}
		});
		slider.draw();
	}
	function hideDownloadLink() {
		document.getElementById("aDownloadChart").style.display = "none";
	}
	if (document.getElementById("rdioMultiSource").checked) {
		var googleData = new google.visualization.DataTable();
		dataArray = [];
		dateArray = [];
		seriesArray = [];
		var i = 0;
		for (var i = 0; i < rawDataTable.getNumberOfRows(); i++) {
			var currentDate = rawDataTable.getValue(i, 1);
			if (dataArray[currentDate] == null) {
				dataArray[currentDate] = [];
				dateArray.push(currentDate);
			}
			
			dataArray[currentDate][rawDataTable.getValue(i, 0)] = {"Pos": rawDataTable.getValue(i, 2),
					"Net": rawDataTable.getValue(i, 3), "AppAppDis": rawDataTable.getValue(i, 4)};
			seriesArray.push(rawDataTable.getValue(i, 0));
		}
		dateArray = Array.from(new Set(dateArray));
		seriesArray = Array.from(new Set(seriesArray));
		seriesArray.sort();
		googleData.addColumn('string', 'Method');
		googleData.addColumn('date', 'Date');
		for (var i = 0; i < seriesArray.length; i++) {
			googleData.addColumn('number', getFullSeriesName(seriesArray[i]));
			googleData.addColumn({'type': 'string', 'role': 'tooltip'});
		}
		googleData.addRows(dateArray.length * 3);
		
		for (var i = 0; i < dateArray.length * 3; i += 3) {
			var currentDate = dateArray[i / 3];
			googleData.setValue(i, 1, new Date(currentDate));
			googleData.setValue(i, 0, "Positive");
			
			for (var j = 0; j < seriesArray.length; j++) {
				if (dataArray[currentDate] != null && dataArray[currentDate][seriesArray[j]] != null
						 && dataArray[currentDate][seriesArray[j]]["Pos"] != null) {
					googleData.setValue(i, 2 * j + 2, dataArray[currentDate][seriesArray[j]]["Pos"]);
					var tooltip = getFullSeriesName(seriesArray[j]) + "\n%Positive: "
							+ dataArray[currentDate][seriesArray[j]]["Pos"];
					if (seriesInformation != null
							&& seriesInformation[currentCountry] != null
							&& seriesInformation[currentCountry][seriesArray[j]] != null) {
						var info = seriesInformation[currentCountry][seriesArray[j]];
						tooltip	+= "\nQuestion type: " + (info["questionType"] == "" ? "Unavailable" : info["questionType"])
								+ "\nQuestion wording: " + (info["questionWording"] == "" ? "Unavailable" : info["questionWording"]);
					}
					googleData.setValue(i, 2 * j + 3, tooltip);
				}
			}
			googleData.setValue(i + 1, 1, new Date(currentDate));
			googleData.setValue(i + 1, 0, "Net");
			for (var j = 0; j < seriesArray.length; j++) {
				if (dataArray[currentDate] != null && dataArray[currentDate][seriesArray[j]] != null
						 && dataArray[currentDate][seriesArray[j]]["Net"] != null) {
					googleData.setValue(i + 1, 2 * j + 2, dataArray[currentDate][seriesArray[j]]["Net"]);
					var tooltip = getFullSeriesName(seriesArray[j]) + "\n%Net: "
							+ dataArray[currentDate][seriesArray[j]]["Net"];
					if (seriesInformation != null
							&& seriesInformation[currentCountry] != null
							&& seriesInformation[currentCountry][seriesArray[j]] != null) {
						var info = seriesInformation[currentCountry][seriesArray[j]];
						tooltip	+= "\nQuestion type: " + (info["questionType"] == "" ? "Unavailable" : info["questionType"])
								+ "\nQuestion wording: " + (info["questionWording"] == "" ? "Unavailable" : info["questionWording"]);
					}
					googleData.setValue(i + 1, 2 * j + 3, tooltip);
				}
			}
			googleData.setValue(i + 2, 1, new Date(currentDate));
			googleData.setValue(i + 2, 0, "App/App + Dis");
			for (var j = 0; j < seriesArray.length; j++) {
				if (dataArray[currentDate] != null && dataArray[currentDate][seriesArray[j]] != null
						 && dataArray[currentDate][seriesArray[j]]["AppAppDis"] != null) {
					googleData.setValue(i + 2, 2 * j + 2, dataArray[currentDate][seriesArray[j]]["AppAppDis"]);
					var tooltip = getFullSeriesName(seriesArray[j]) + "\n%App / (%App + %Dis): "
							+ dataArray[currentDate][seriesArray[j]]["AppAppDis"];
					if (seriesInformation != null
							&& seriesInformation[currentCountry] != null
							&& seriesInformation[currentCountry][seriesArray[j]] != null) {
						var info = seriesInformation[currentCountry][seriesArray[j]];
						tooltip	+= "\nQuestion type: " + (info["questionType"] == "" ? "Unavailable" : info["questionType"])
								+ "\nQuestion wording: " + (info["questionWording"] == "" ? "Unavailable" : info["questionWording"]);
					}
					googleData.setValue(i + 2, 2 * j + 3, tooltip);
				}
			}
		}
		
		var dataView = new google.visualization.DataView(googleData);
		var dashboard = new google.visualization.Dashboard(
			document.getElementById('divDashboardChart'));

		document.getElementById("divCalculationControl").style.display = "block";
		var calculationFilter = new google.visualization.ControlWrapper({
			'controlType': 'CategoryFilter',
			'containerId': 'divCalculationControl',
			'options': {
				'height': 20,
				'filterColumnLabel': 'Method',
				ui: {
					'label': 'Calculation Method',
					'allowTyping': false,
					'allowMultiple': false,
					'allowNone': false
				}
			}
		});
		
		chart = new google.visualization.ChartWrapper({
			'chartType': 'LineChart',
			'containerId': 'divChart',
			'dataTable': dataView,
			'view': {'columns': [1, 2]},
			'options': {
				'legend': {'position': 'top', 'maxLines': 20},
				'chartArea': {'left': '12%', 'width': '80%'},
				'vAxis': {
					'maxValue': 100,
					'format': '0'
				},
				'hAxis': {
					'format': 'MMM, yyyy'
				},
				'height': 500,
				'width': '100%',
				'interpolateNulls': true,
				'curveType': 'function',
				'pointSize': 3,
				'explorer': {
					'axis': 'horizontal',
					'keepInBounds': true,
					'maxZoomIn': .01,
					'maxZoomOut': 1,
					'actions': ['dragToZoom', 'rightClickToReset']
				}
			},
		});

		var seriesTable = new google.visualization.DataTable();
		seriesTable.addColumn('number', 'index');
		seriesTable.addColumn('string', 'label');
		for (var i = 0; i < seriesArray.length; i++) {
			seriesTable.addRows([[2 * i + 2, getFullSeriesName(seriesArray[i])]]);
		}
		
		var seriesFilter = new google.visualization.ControlWrapper({
			'controlType': 'CategoryFilter',
			'containerId': 'divSeriesControl',
			'dataTable': seriesTable,
			'options': {
				'filterColumnLabel': 'label',
				ui: {
					'label': 'Series filter',
					'allowTyping': false,
					'allowMultiple': true,
					'allowNone': true
				}
			}
		});
		function seriesFilterChange() {
			var state = seriesFilter.getState();
			var row;
			var indices = [0, 1];
			if (state.selectedValues.length > 0) {
				for (var i = 0; i < state.selectedValues.length; i++) {
					row = seriesTable.getFilteredRows([{column: 1, value: state.selectedValues[i]}])[0];
					indices.push(seriesTable.getValue(row, 0));
					indices.push(seriesTable.getValue(row, 0) + 1);
				}
			} else {
				for (var i = 0; i < seriesTable.getNumberOfRows(); i++) {
					indices.push(i + 2);
				}
			}
			dataView.setColumns(indices);
			var chartColumns = [];
			for (i = 1; i < indices.length; i++) chartColumns.push(i);
			calculationFilter.draw();
			chart.setView({columns: chartColumns});
			chart.draw();
			hideDownloadLink();
		}
		google.visualization.events.addListener(seriesFilter, 'statechange', seriesFilterChange);
		google.visualization.events.addListener(calculationFilter, 'statechange', function () {
			if (calculationFilter.getState().selectedValues[0] == 'Net') {
				chart.setOption('vAxis', {'minValue': -100 ,'maxValue': 100});
			} else {
				chart.setOption('vAxis', {'minValue': 0 ,'maxValue': 100});
			}
		});
		dataView.setColumns([0, 1, seriesTable.getValue(0, 0)]);
		seriesFilter.draw();
		dashboard.bind(calculationFilter, chart);
		dashboard.draw(dataView);
		seriesFilterChange();

		google.visualization.events.addListener(calculationFilter, "statechange", hideDownloadLink);
	} else { // If user chooses multiple calculations.
		// Name dictionary to look up series information later. All abbreviated series names were replaced by full name
		// but info can only be looked up using abbreviated name.
		var seriesNameDictionary = [];
		var googleData = rawDataTable.clone(); // Clone original table for internal use
		for (var i = 0; i < rawDataTable.getNumberOfRows(); i++) {
			var fullSeriesName = getFullSeriesName(rawDataTable.getValue(i, 0));
			seriesNameDictionary[fullSeriesName] = rawDataTable.getValue(i, 0);
			googleData.setCell(i, 0, fullSeriesName);
		}
		var dashboard = new google.visualization.Dashboard(
			document.getElementById('divDashboardChart'));

		document.getElementById("divCalculationControl").style.display = "none";
 
		var seriesFilter = new google.visualization.ControlWrapper({
			'controlType': 'CategoryFilter',
			'containerId': 'divSeriesControl',
			'options': {
				'filterColumnLabel': 'Source',
				ui: {
					'label': 'Series',
					'allowTyping': false,
					'allowMultiple': false,
					'allowNone': false
				}
			}
		});
		
		chart = new google.visualization.ChartWrapper({
			'chartType': 'LineChart',
			'containerId': 'divChart',
			'view': {'columns': [1, 2, 3, 4]},
			'options': {
				'vAxis': {
					'minValue': -100,
					'maxValue': 100,
					'format': '0'
				},
				'hAxis': {
					'format': 'MMM, yyyy'
				},
				
				'title': 'Executive approval rate',
				'height': 500,
				'width': '100%',
				'interpolateNulls': true,
				'curveType': 'function',
				'pointSize': 3,
				'explorer': {
					'axis': 'horizontal',
					'keepInBounds': true,
					'maxZoomIn': .01,
					'maxZoomOut': 1,
					'actions': ['dragToZoom', 'rightClickToReset']
				}
			},
			'ui': {
				'chartOptions': {
					'chartArea': {'width': '80%'}
				}
			}
		});
		var seriesFilterChange = function() {
			var selected = seriesFilter.getState().selectedValues[0];
			var questionWording = document.getElementById("questionWording");
			questionWording.innerText = "Question type: Unavailable\nQuestion wording: Unavailable";
			if (seriesNameDictionary[selected] != null) selected = seriesNameDictionary[selected];
			if (seriesInformation != null
					&& seriesInformation[currentCountry] != null
					&& seriesInformation[currentCountry][selected] != null) {
				var info = seriesInformation[currentCountry][selected];
				questionWording.innerText = "\nQuestion type: " + (info["questionType"] == "" ? "Unavailable" : info["questionType"])
						+ "\nQuestion wording: " + (info["questionWording"] == "" ? "Unavailable" : info["questionWording"]);
			}
		};
		google.visualization.events.addListener(seriesFilter, 'statechange', seriesFilterChange);
		seriesFilter.draw();
		dashboard.bind(seriesFilter, chart);
		dashboard.draw(googleData);
		google.visualization.events.addListener(chart, "ready", function() {
			seriesFilterChange();
		});
	}

	// After finishing loading.
	document.getElementById("btnLoadTable").style.display = "block";
	document.getElementById("btnDownloadTable").style.display = "none";
	document.getElementById("tableInfoTip").style.display = "none";
	document.getElementById("divTableSeriesControl").innerHTML = "";
	document.getElementById("divTableDateControl").innerHTML = "";
	document.getElementById("divTable").innerHTML = "";
	google.visualization.events.addListener(chart, "ready", function() {
		document.getElementById("imgChartLoading").style.display = "none";
	});
}

function loadTable() {
	document.getElementById("imgTableLoading").style.display = "block";
	document.getElementById("btnLoadTable").style.display = "none";
	var tableDashboard = new google.visualization.Dashboard(
		document.getElementById('divDashboardTable'));
	
	var seriesFilterTable = new google.visualization.ControlWrapper({
		'controlType': 'CategoryFilter',
		'containerId': 'divTableSeriesControl',
		'options': {
			'filterColumnLabel': 'Source',
			ui: {
				'label': 'Series',
				'allowTyping': false,
				'allowMultiple': true,
			}
		},
	});
	
	var dateFilterTable = new google.visualization.ControlWrapper({
		'controlType': 'DateRangeFilter',
		'containerId': 'divTableDateControl',
		'options': {
			'filterColumnLabel': 'Date',
			ui: {
				'label': 'Date',
			}
		},
	});

	table = new google.visualization.ChartWrapper({
		'chartType': 'Table',
		'containerId': 'divTable',
		'options': {
			'sortColumn': 1,
			'sortAscending': true,
			'title': 'Executive approval rate',
			'height': 500,
			'width': '100%',
			'interpolateNulls': true,
		},
	});
	
	function hideDownloadLink() {
		document.getElementById("aDownloadTable").style.display = "none";
	}

	tableDashboard.bind(seriesFilterTable, dateFilterTable);
	tableDashboard.bind(dateFilterTable, table);
	tableDashboard.draw(rawDataTable);
	google.visualization.events.addListener(table, "ready", function() {
		document.getElementById("imgTableLoading").style.display = "none";
		document.getElementById("btnDownloadTable").style.display = "block";
		document.getElementById("tableInfoTip").style.display = "block";
		google.visualization.events.addListener(table.getChart(), "sort", function(e) {
			hideDownloadLink();
		});
	});
	
	google.visualization.events.addListener(dateFilterTable, "statechange", hideDownloadLink);
	google.visualization.events.addListener(seriesFilterTable, "statechange", hideDownloadLink);
}

function countryChanged() {
	var countryElement = document.getElementById("country");
	if (countryElement.selectedIndex > 0) {
		var value = countryElement.options[countryElement.selectedIndex].value;
		currentCountry = value;
		document.getElementById("divBottom").style.display = "block";
		document.getElementById("imgChartLoading").style.display = "block";
		function callBack(response) { // Call back function for when the query arrives
			rawDataTable = response.getDataTable();
			rawDataTable.setColumnLabel(0, 'Source');
			rawDataTable.setColumnLabel(1, 'Date');
			rawDataTable.setColumnLabel(2, '%Positive');
			rawDataTable.setColumnLabel(3, '%Net');
			rawDataTable.setColumnLabel(4, '%App/%App + %Dis');
			loadChartData();
		}
		queryGoogleSheet(mainSheetId, "SELECT A, B, D, E, F WHERE H = '" + currentCountry + "' ORDER BY B", callBack);
		/*
		var url = "load-data-google-charts.jsp?country=" + value;
		ajaxGeneric(url, function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				rawData = xmlhttp.responseText;
				loadChartData(rawData);
			}
		});*/
	}
}

function methodChange() {
	var countryElement = document.getElementById("country");
	if (countryElement.selectedIndex > 0) {
		loadChartData();
	}
}

function loadCountryNames() { // Function to get country names and series information
	function callBackSeriesInformation(response) {
		var data = response.getDataTable();
		seriesInformation = {};
		for (var i = 0; i < data.getNumberOfRows(); i++) {
			if (seriesInformation[data.getValue(i, 0)] == null) {
				seriesInformation[data.getValue(i, 0)] = {};
			}
			if (seriesInformation[data.getValue(i, 0)][data.getValue(i, 1)] == null) {
				seriesInformation[data.getValue(i, 0)][data.getValue(i, 1)] = {};
			}
			seriesInformation[data.getValue(i, 0)][data.getValue(i, 1)]['description'] = data.getValue(i, 2);
			seriesInformation[data.getValue(i, 0)][data.getValue(i, 1)]['questionType'] = data.getValue(i, 3);
			seriesInformation[data.getValue(i, 0)][data.getValue(i, 1)]['questionWording'] = data.getValue(i, 4);
		}
		
		// We need to retrieve the series information first before we fetch the main data
		function callBackMain(response) { // Call back function for when the data arrives
			var data = response.getDataTable();
			var countryHTML = "<option selected disabled>Select Country</option>";
			for (var i = 0; i < data.getNumberOfRows(); i++) {
				countryHTML += "<option>" + data.getValue(i, 0) + "</option>";
			}
			document.getElementById("country").innerHTML += countryHTML;
		}
		queryGoogleSheet(mainSheetId, 'SELECT H, COUNT(A) GROUP BY H', callBackMain);
	}
	queryGoogleSheet(seriesInfoSheetId, 'SELECT *', callBackSeriesInformation);
}

function queryGoogleSheet(id, queryString, callBack) {
	var url = "https://docs.google.com/spreadsheets/d/" + id + "/gviz/tq?gid=0&headers=1";
	var query = new google.visualization.Query(url);
	query.setQuery(queryString);
	query.send(callBack);
}

function downloadChart() {
	if (chart != null) {
		var link = document.getElementById("aDownloadChart");
		var uri = chart.getChart().getImageURI();
		var image = new Image;
		image.src = uri;
		var canvas = document.createElement('CANVAS');
		var context = canvas.getContext('2d');
		image.onload = function() {
			canvas.width = image.width;
			canvas.height = image.height;
			context.drawImage(image, 0, 0);
			context.font = "12px Montserrat, Verdana";
			var paddingLeft = chart.getOption('chartArea')['left'];
			paddingLeft = paddingLeft.substring(0, paddingLeft.length - 1);
			paddingLeft = canvas.width * paddingLeft / 100;
			context.fillText("Source: The Executive Approval Project v.1.0", paddingLeft, canvas.height - 12);
			var newURI = canvas.toDataURL();
			link.href = newURI;
			link.download = "executive-approval-" + document.getElementById("country").value + ".png";
			link.style.display = "block";
		}
	}
}

function downloadTable() {
	if (table != null) {
		var csv = "";
		var sortedIndexes = table.getChart().getSortInfo()['sortedIndexes'];
		var dataTable = table.getDataTable();
		var dateFormat = new google.visualization.DateFormat({'pattern': 'MMM dd, YYYY'});
		dateFormat.format(dataTable, 0);
		for (var i = -1; i < dataTable.getNumberOfRows(); i++) {
			var row = i < 0 ? i : sortedIndexes[i];
			for (var j = 0; j < dataTable.getNumberOfColumns(); j++) {
				if (row < 0) {
					csv += String(dataTable.getColumnLabel(j).replace(",", "")).trim();
				} else {
					if (j != 1) {
						if (dataTable.getValue(row, j) != null) {
							csv += String(dataTable.getValue(row, j)).trim();
						}
					} else {
						date = dataTable.getValue(row, j);
						csv += String(date.toLocaleDateString("en-US")).trim();
					}
				}
				if (j < dataTable.getNumberOfColumns() - 1) csv += ",";
			}
			if (i < dataTable.getNumberOfRows() - 1) csv += "%0A";
		}
		var link = document.getElementById("aDownloadTable");
		link.href = "data:," + csv;
		link.download = "executive-approval-" + document.getElementById("country").value + ".csv";
		link.style.display = "block";
	}
}

function ajaxGeneric(url, func) {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();

    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = func;
    xmlhttp.open("GET", url, false);
    xmlhttp.send(null);
}