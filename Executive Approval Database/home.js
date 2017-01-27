const COOKIE_FIRST_NAME = 0;
const COOKIE_LAST_NAME = 1;
const COOKIE_EMAIL = 2;
const COOKIE_AFFILIATION = 3;

google.charts.load('current', {'packages':['controls', 'corechart', 'table']});
google.charts.setOnLoadCallback(loadCountryNames);
var mainSheetId = '1sm_8DP0YY6k3mUwqfOudphbI-Wdcl3LIRETK2nnB2JU';
var seriesInfoSheetId = '1edCytqaKWUbRQnwMbUocTTZcC3DVGJ0jTFpEfu0qBys';
var rawDataTable; // Global Google datatable object
var table;
var chart;
var seriesInformation, seriesFilter, currentCountry;

// Determine what to do after prompting user info.
var currentDownloadAction;
function getFullSeriesName(abbreviation) {
	if (seriesInformation != null
			&& seriesInformation[currentCountry] != null
			&& seriesInformation[currentCountry][abbreviation] != null) {
		return seriesInformation[currentCountry][abbreviation]['description'];
	} else {
		return abbreviation;
	}
}
function loadChartData() {
	document.getElementById("questionWording").innerText = "";
	
	function resetSlider(slider) {
		slider.setState({
			range: {
				start: new Date("1000-01-01"),
				end: new Date("3000-01-01")
			}
		});
		slider.draw();
	}
	function getDateString(date) {
		return date.getMonth() + '/' + date.getDay() + '/' + date.getFullYear();
	}
	if (document.getElementById("rdioMultiSource").checked) { // If multiple source method is selected
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
			
			dataArray[currentDate][rawDataTable.getValue(i, 0)] = {"Pos": rawDataTable.getValue(i, 3),
					"Neg": rawDataTable.getValue(i, 4), "Net": rawDataTable.getValue(i, 5),
					"AppAppDis": rawDataTable.getValue(i, 6)};
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
		googleData.addRows(dateArray.length * 4);
		
		for (var i = 0; i < dateArray.length * 4; i += 4) {
			var currentDate = dateArray[i / 4];
			googleData.setValue(i, 1, new Date(currentDate));
			googleData.setValue(i, 0, "Positive");
			googleData.setValue(i + 1, 1, new Date(currentDate));
			googleData.setValue(i + 1, 0, "Negative");
			googleData.setValue(i + 2, 1, new Date(currentDate));
			googleData.setValue(i + 2, 0, "Net");
			googleData.setValue(i + 3, 1, new Date(currentDate));
			googleData.setValue(i + 3, 0, "Relative Approval");
			for (var j = 0; j < seriesArray.length; j++) {
				if (dataArray[currentDate] != null && dataArray[currentDate][seriesArray[j]] != null
						 && dataArray[currentDate][seriesArray[j]]["Pos"] != null) {
					googleData.setValue(i, 2 * j + 2, dataArray[currentDate][seriesArray[j]]["Pos"]);
					var tooltip = getFullSeriesName(seriesArray[j]) + "\nDate: " + getDateString(currentDate) + "\n%Positive: "
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
				if (dataArray[currentDate] != null && dataArray[currentDate][seriesArray[j]] != null
						 && dataArray[currentDate][seriesArray[j]]["Neg"] != null) {
					googleData.setValue(i + 1, 2 * j + 2, dataArray[currentDate][seriesArray[j]]["Neg"]);
					var tooltip = getFullSeriesName(seriesArray[j]) + "\nDate: " + getDateString(currentDate) + "\n%Negative: "
							+ dataArray[currentDate][seriesArray[j]]["Neg"];
					if (seriesInformation != null
							&& seriesInformation[currentCountry] != null
							&& seriesInformation[currentCountry][seriesArray[j]] != null) {
						var info = seriesInformation[currentCountry][seriesArray[j]];
						tooltip	+= "\nQuestion type: " + (info["questionType"] == "" ? "Unavailable" : info["questionType"])
								+ "\nQuestion wording: " + (info["questionWording"] == "" ? "Unavailable" : info["questionWording"]);
					}
					googleData.setValue(i + 1, 2 * j + 3, tooltip);
				}
				if (dataArray[currentDate] != null && dataArray[currentDate][seriesArray[j]] != null
						 && dataArray[currentDate][seriesArray[j]]["Net"] != null) {
					googleData.setValue(i + 2, 2 * j + 2, dataArray[currentDate][seriesArray[j]]["Net"]);
					var tooltip = getFullSeriesName(seriesArray[j]) + "\nDate: " + getDateString(currentDate) + "\n%Net: "
							+ dataArray[currentDate][seriesArray[j]]["Net"];
					if (seriesInformation != null
							&& seriesInformation[currentCountry] != null
							&& seriesInformation[currentCountry][seriesArray[j]] != null) {
						var info = seriesInformation[currentCountry][seriesArray[j]];
						tooltip	+= "\nQuestion type: " + (info["questionType"] == "" ? "Unavailable" : info["questionType"])
								+ "\nQuestion wording: " + (info["questionWording"] == "" ? "Unavailable" : info["questionWording"]);
					}
					googleData.setValue(i + 2, 2 * j + 3, tooltip);
				}
				if (dataArray[currentDate] != null && dataArray[currentDate][seriesArray[j]] != null
						 && dataArray[currentDate][seriesArray[j]]["AppAppDis"] != null) {
					googleData.setValue(i + 3, 2 * j + 2, dataArray[currentDate][seriesArray[j]]["AppAppDis"]);
					var tooltip = getFullSeriesName(seriesArray[j]) + "\nDate: " + getDateString(currentDate) + "\nRelative Approval: "
							+ dataArray[currentDate][seriesArray[j]]["AppAppDis"];
					if (seriesInformation != null
							&& seriesInformation[currentCountry] != null
							&& seriesInformation[currentCountry][seriesArray[j]] != null) {
						var info = seriesInformation[currentCountry][seriesArray[j]];
						tooltip	+= "\nQuestion type: " + (info["questionType"] == "" ? "Unavailable" : info["questionType"])
								+ "\nQuestion wording: " + (info["questionWording"] == "" ? "Unavailable" : info["questionWording"]);
					}
					googleData.setValue(i + 3, 2 * j + 3, tooltip);
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
					'allowNone': false,
					'selectedValuesLayout': 'belowStacked'
				}
			},
			'state': {'selectedValues': ['Positive']}
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
		
		seriesFilter = new google.visualization.ControlWrapper({
			'controlType': 'CategoryFilter',
			'containerId': 'divSeriesControl',
			'dataTable': seriesTable,
			'options': {
				'filterColumnLabel': 'label',
				ui: {
					'label': 'Visualize',
					'allowTyping': false,
					'allowMultiple': true,
					'allowNone': false,
					'caption': 'Series'
				}
			}
		});
		
		console.log("seriesFilter:");
		console.log(seriesFilter);
		
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
			hideChartDownloadLink();
		}
		google.visualization.events.addListener(seriesFilter, 'statechange', seriesFilterChange);
		google.visualization.events.addListener(calculationFilter, 'statechange', function () {
			seriesFilter.setState({'state': {'selectedValues': [getFullSeriesName(seriesArray[0])]}});
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

		google.visualization.events.addListener(calculationFilter, "statechange", hideChartDownloadLink);
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
 
		seriesFilter = new google.visualization.ControlWrapper({
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
			'view': {'columns': [1, 2, 3, 4, 5]},
			'options': {
				'vAxis': {
					'minValue': -100,
					'maxValue': 100,
					'format': '0'
				},
				'hAxis': {
					'format': 'MMM, yyyy'
				},
				'chartArea': {'left': '5%', 'width': '80%'},
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
	function hideTableDownloadLink() {
		document.getElementById("aDownloadTable").style.display = "none";
	}
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
	
	tableDashboard.bind(seriesFilterTable, dateFilterTable);
	tableDashboard.bind(dateFilterTable, table);
	tableDashboard.draw(rawDataTable);
	google.visualization.events.addListener(table, "ready", function() {
		document.getElementById("imgTableLoading").style.display = "none";
		document.getElementById("btnDownloadTable").style.display = "block";
		document.getElementById("tableInfoTip").style.display = "block";
		google.visualization.events.addListener(table.getChart(), "sort", function(e) {
			hideTableDownloadLink();
		});
	});
	
	google.visualization.events.addListener(dateFilterTable, "statechange", hideTableDownloadLink);
	google.visualization.events.addListener(seriesFilterTable, "statechange", hideTableDownloadLink);
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
            rawDataTable.setColumnLabel(2, 'Sample');
			rawDataTable.setColumnLabel(3, '%Positive');
			rawDataTable.setColumnLabel(4, '%Negative');
			rawDataTable.setColumnLabel(5, '%Net');
			rawDataTable.setColumnLabel(6, 'Relative Approval');
			loadChartData();
		}
		queryGoogleSheet(mainSheetId, "SELECT A, B, C, D, F, G, H WHERE J = '" + currentCountry + "' ORDER BY B", callBack);
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
		queryGoogleSheet(mainSheetId, 'SELECT J, COUNT(A) GROUP BY J', callBackMain);
	}
	queryGoogleSheet(seriesInfoSheetId, 'SELECT *', callBackSeriesInformation);
}

function queryGoogleSheet(id, queryString, callBack) {
	var url = "https://docs.google.com/spreadsheets/d/" + id + "/gviz/tq?gid=0&headers=1";
	var query = new google.visualization.Query(url);
	query.headers = 1;
	query.setQuery(queryString);
	query.send(callBack);
}

function submitInfo() {
	var firstName = document.getElementsByName("firstName")[0].value.trim();
	var lastName = document.getElementsByName("lastName")[0].value.trim();
	var email = document.getElementsByName("email")[0].value.trim();
	var affiliation = document.getElementsByName("affiliation")[0].value.trim();
	if (firstName == "" || lastName == "" || email == "" || affiliation == "") {
		alert("Please fill out all required information.")
		return;
	}
	var cookie = "data=" + firstName;
	cookie += "|" + lastName;
	cookie += "|" + email;
	cookie += "|" + affiliation;
	document.cookie = cookie;
	currentDownloadAction();
	currentDownloadAction = null;
	hideInfo();
}

function getAttributeFromCookie(index) {
	var cookies = document.cookie.split("=")[1].split("|");
	if (index < cookies.length) return cookies[index];
	return null;
}

function checkCookie() {
	if (document.cookie == "") {
		return false;
	} else {
		return true;
	}
}

function logDownload(type) {
	var args = "firstName=" + getAttributeFromCookie(COOKIE_FIRST_NAME);
	args += "&lastName=" + getAttributeFromCookie(COOKIE_LAST_NAME);
	args += "&email=" + getAttributeFromCookie(COOKIE_EMAIL);
	args += "&affiliation=" + getAttributeFromCookie(COOKIE_AFFILIATION);
	args += "&type=" + type;
	args += "&country=" + currentCountry;
	ajaxPost("log.php", args, null);
}

function downloadChart() {
	if (!checkCookie()) {
		currentDownloadAction = function() {downloadChart();};
		showInfo();
		return;
	}
	logDownload("Chart");
	if (chart != null) {
		var inputHeight = document.getElementById('heightInput').value;
		var inputWidth = document.getElementById('widthInput').value;

		if(inputHeight != '' && inputWidth != ''){
			chart.setOption('height', inputHeight);
			chart.setOption('width', inputWidth);
			chart.draw();
		}
		
		var previewLink = document.getElementById("aPreviewChart");
		var downloadLink = document.getElementById("aDownloadChart");
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
			previewLink.href = newURI;
			previewLink.style.display = "block";
			downloadLink.href = newURI;
			downloadLink.download = "executive-approval-" + document.getElementById("country").value + ".png";
			downloadLink.style.display = "block";
		}
		//Revert back the changes if originally changed
		if(inputHeight != '' && inputWidth != ''){
			chart.setOption('height', 500);
			chart.setOption('width', '100%');
			chart.draw();
		}		
	}
}

// Function to hide download links when uses make changes to the chart.
function hideChartDownloadLink() {
	document.getElementById("aPreviewChart").style.display = "none";
	document.getElementById("aDownloadChart").style.display = "none";
}

function downloadTable() {
	if (!checkCookie()) {
		currentDownloadAction = function() {downloadTable();};
		showInfo();
		return;
	}
	logDownload("Table");
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

function hideInfo() {
	document.getElementById("infoDiv").style.opacity = 0;
	setTimeout(function() {
		document.getElementById("mainDiv").style.filter = "blur(0)";
		document.getElementById("infoDiv").style.display = "none";
		document.getElementById("middleLayer").style.display = "none";	
	}, 200);
}

function showInfo() {
	document.getElementById("infoDiv").style.display = "block";
	document.getElementById("infoDiv").style.opacity = 1;
	document.getElementById("mainDiv").style.filter = "blur(5px)";
	document.getElementById("middleLayer").style.display = "block";	
}

function ajaxPost(url, args, func) {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();

    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = func;
    xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(args);
} 

var groups = {};

// Format the data as tab-separated variables for WCalc
function constructTsv(){
	var dataTsv = "";
	for(var i = 0; i < rawDataTable.getNumberOfRows(); i++){
		console.log(i);
		var rawName = rawDataTable.getValue(i, 0);
		if(typeof seriesInformation[currentCountry] == 'undefied'){
			console.log("Warning! " + currentCountry + " could not be found! Perhaps it is mispelled in the database?");
		}
		if(typeof seriesInformation[currentCountry][rawName] == 'undefined'){
			var name = rawName;
		}else{
			var name = seriesInformation[currentCountry][rawName].description;
		}
		var date = new Date(rawDataTable.getValue(i, 1));
		date = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
		var sample = rawDataTable.getValue(i, 2);
        // substitute unvailable sample-sizes with 1000
		if(isNaN(sample) || sample == null){
			sample = 1000;
		}
		var pos = rawDataTable.getValue(i, 3);
		if(pos == null || isNaN(pos) || date == null){
			continue;
		}
		if(groups[name] == null){
			groups[name] = [];
		}
		groups[name].push([date, pos, sample]);
		//dataTsv = dataTsv + name + "\t" + date + "\t" + pos + "\t" + sample + "\n";
	}
	var dataSelectionForm = document.getElementById('dataSelectionForm');
	var dataSelection = getRadioVal(dataSelectionForm, 'dataSelection');
	if(dataSelection == 'allData'){
		for(var name in groups){
			// skip datapoints with only one entry
			if(groups[name].length == 1){
				continue;
			}
			for(var i = 0; i < groups[name].length; i++){
				dataTsv = dataTsv + name + "\t" + groups[name][i][0] + "\t" + groups[name][i][1] + "\t" + groups[name][i][2] + "\n";
			}
		}
	}else{
		var selectedValuesArray = seriesFilter.getState().selectedValues;
		for(var i = 0; i < selectedValuesArray.length; i++){
			// skip datapoints with only one entry
			var name = selectedValuesArray[i];
			if(groups[name].length == 1){
				continue;
			}
			for(var j = 0; j < groups[name].length; j++){
				dataTsv = dataTsv + name + "\t" + groups[name][j][0] + "\t" + groups[name][j][1] + "\t" + groups[name][j][2] + "\n";
			}
		}
	}
	console.log("groups");
	console.log(groups);
	return dataTsv;
}

// Begin the data aggregation process
function aggregateData(div){
	if(div.innerHTML != "Proceed"){
		$("#result").fadeOut("slow");
		$("#aggregationOptions").fadeIn("slow");
		div.innerHTML = "Proceed";
	}else{
		$("#aggregationOptions").fadeOut("slow");
		var dataTsv = constructTsv();
		feedData(dataTsv);
		div.innerHTML = "Aggregate Data";
		$("#result").fadeIn("slow");
	}
}
