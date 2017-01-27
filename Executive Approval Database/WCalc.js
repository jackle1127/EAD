/* This is an implementation of the WCalc Algorithm
 * 
 * Original Author:
 * Dr. James Simson (stimson.web.unc.edu)
 * 
 * Implementation By:
 * Madison Hanberry (https://github.com/mhanberry1)
 * 
 * In Association With the Georgia State University CETL
 */


// Globals
var nperiods = 0;
var cases = [];
var years = [];
var variable_names = [];
var valid = [];
var sign = [];
var xsmooth = [];
var alpha = 1;
var alphaF = 1;
var mood_forward = {};
var mood_backward = {};
var pIssue = {};
var testLog = "";
var globalDat;
var smoothing = false; // Change this using the interface
var aggregationPeriod = "yearly"; // Change this using the interface
var dataCount = 0;

// drives the entire program flow
// returns null
// (for testing purposes)
function feedData(dataString){
    console.log("In feedData");
    var div = document.getElementById('result');
    div.scrollIntoView();
    div.innerHTML = "";
    //var dataString = document.getElementById('data').value;
	console.log(dataString);
    var controls = document.getElementById('controls');
    this.aggregationPeriod = getRadioVal(controls, 'aggregation');
    var data = tsvParse(dataString, 2);
    // Check smoothing selection
    if(document.getElementById('smoothing').checked){
        this.smoothing = true;
    }else{
       this.smoothing = false; 
    }
    var result = solve(data[2], data[0], data[1]);
    div.appendChild(document.createTextNode("Log Results:"));
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createElement('br'));
    this.testLog = result[0];
    var log = result[0].split("\n");
    // Create a table for the log
    var div = document.getElementById('result');
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    for (var i = 0; i < log.length; i++) {
        var tr = document.createElement('tr');
        var row = log[i].split("\t");
        for (var j = 0; j < row.length; j++) {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(row[j]));
            if(row.length == 1){
                td.setAttribute('colspan', 3);
            }else{
                td.setAttribute('colspan', 1);
            }
            tr.appendChild(td);
        }
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
    div.appendChild(tbl);
    
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createTextNode("Approval Averages:"));
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createElement('br'));
    
	var moodAveragesContainer = document.createElement('div');
	moodAveragesContainer.id = "moodAverages";
    var tbl = document.createElement('table');
    tbl.style.width = '100%';
    tbl.setAttribute('border', '1');
    var tbdy = document.createElement('tbody');
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.appendChild(document.createTextNode("Year"));
	td.appendChild(document.createElement('br'));
	td.appendChild(document.createTextNode("- - - - - - -"))
    tr.appendChild(td);
    if(aggregationPeriod == "monthly"){
        var td = document.createElement('td');
        td.appendChild(document.createTextNode("Month"));
		td.appendChild(document.createElement('br'));
		td.appendChild(document.createTextNode("- - - - - - -"))
        tr.appendChild(td);
    }else if(aggregationPeriod == "quarterly"){
        var td = document.createElement('td');
        td.appendChild(document.createTextNode("Quarter"));
		td.appendChild(document.createElement('br'));
		td.appendChild(document.createTextNode("- - - - - - -"))
        tr.appendChild(td);
    }
    var td = document.createElement('td');
    td.appendChild(document.createTextNode("Approval"));
	td.appendChild(document.createElement('br'));
	td.appendChild(document.createTextNode("- - - - - - -"))
    tr.appendChild(td);
    tbdy.appendChild(tr);
    for(var year in result[1]){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        if(this.aggregationPeriod == "yearly"){
            td.appendChild(document.createTextNode(year));
            tr.appendChild(td);
        }else{
            td.appendChild(document.createTextNode(year.substring(0, 4)));
            tr.appendChild(td);
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(year.substring(4, year.length)));
            tr.appendChild(td);
        }
        td = document.createElement('td');
        td.appendChild(document.createTextNode(result[1][year].toFixed(3)));
        tr.appendChild(td);
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);
	moodAveragesContainer.appendChild(tbl);
    div.appendChild(moodAveragesContainer);
}

// form: a form that contains radio buttons
// name: The name of the radio button block
// returns the name of the selected radio button
function getRadioVal(form, name) {
    console.log("In getRadioVal");
    var val;
    // get list of radio buttons with specified name
    var radios = form.elements[name];
    
    // loop through list of radio buttons and store the active names
    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) {
            val = radios[i].id;
            break;
        }
    }
    return val;
}

// tsvData: tab separated data
//  column: the number of the column containing the data to be processed
// returns an array in which the first two elements are "start" and "end"
// respectively and the final element is an object containing data
function tsvParse(tsvData, column){
    console.log("In tsvParse");
    var dataRows = tsvData.split(/[\n]+/);
    var dataTable = [];
    var result = [];
    for(var i = 0; i < dataRows.length; i++){
        dataTable.push(dataRows[i].split(/[\t]+/));
		if(dataTable[i].length == 1){
			console.log("dataTable[" + i + "] = " + dataTable[i]);
			dataTable.pop();
		}
    }
    
    // Find the starting and ending years
    var start = -1;
    var end = -1;
    for(var i = 0; i < dataTable.length; i++){
        if(dataTable[i][1] == null){
			console.log("dataTable[" + i + "] = " + dataTable[i]);
            continue;
        }
        if(this.aggregationPeriod == "yearly"){
            var period = dataTable[i][1].split("/")[2];
        }else if(aggregationPeriod == "quarterly"){
            var year = dataTable[i][1].split("/")[2];
            var quarter = (parseInt(dataTable[i][1].split("/")[0]) - 1) / 3;
            quarter = parseInt(quarter) + 1;
            var period = year + quarter;
        }else if(this.aggregationPeriod == "monthly"){
            var year = dataTable[i][1].split("/")[2];
            var month = dataTable[i][1].split("/")[0];
            if(month.length != 2){
                month = "0" + month;
            }
            var period = year + month;
        }
        if(period < start || start == -1){
            start = period;
        }
        if(period > end || end == -1){
            end = period;
        }
    }
    result.push(start);
    result.push(end);
    
    // Create data array
    var data = {};
    var yearlySampleSize = {};
    this.dataCount = dataTable.length;
    for(var i = 0; i < this.dataCount; i++){
        var currentVar = dataTable[i][0];
        if(cases[currentVar] == null){
            cases[currentVar] = 0;
        }
        var prevPeriod = currentPeriod;
        // select currentPeriod based on aggregationPeriod
        if(this.aggregationPeriod == "yearly"){
            var currentPeriod = dataTable[i][1].split("/")[2];
        }else if(this.aggregationPeriod == "quarterly"){
            var year = dataTable[i][1].split("/")[2];
            var quarter = (parseInt(dataTable[i][1].split("/")[0]) - 1) / 3;
            quarter = parseInt(quarter) + 1;
            var currentPeriod = year + quarter;
        }else if(this.aggregationPeriod == "monthly"){
            var year = dataTable[i][1].split("/")[2];
            var month = dataTable[i][1].split("/")[0];
            if(month.length != 2){
                month = "0" + month;
            }
            var currentPeriod = year + month;
        }
        if(i != 0){
            var prevVar = dataTable[i - 1][0];
            if(currentVar != prevVar){
                yearlySampleSize[currentVar] = {};
                yearlySampleSize[currentVar][currentPeriod] = 0;
                // Delete entries with only one element
                var numEntries = 0;
                for(var entry in data[prevVar]){
                    numEntries++;
                }
                if(numEntries < 2 || i == this.dataCount - 1){
                    delete data[prevVar];
                }
                data[currentVar] = {};
            }else if(yearlySampleSize[currentVar][currentPeriod] == null){
                yearlySampleSize[currentVar][currentPeriod] = 0;
            }
            
        }else{
            data[currentVar] = {};
            yearlySampleSize[currentVar] = {};
            yearlySampleSize[currentVar][currentPeriod] = 0;
        }
        // Populate the data table with a weighted mean for each period and country
        var sampleSize = parseInt(dataTable[i][dataTable[i].length - 1]);
        if(data[currentVar][currentPeriod] != null){
            data[currentVar][currentPeriod] += parseFloat(dataTable[i][column]) * sampleSize;
        }else{
            data[currentVar][currentPeriod] = parseFloat(dataTable[i][column]) * sampleSize;
        }
        console.log("data[" + currentVar + "][" + currentPeriod + "]");
        // Aggregate yearlySampleSize
        yearlySampleSize[currentVar][currentPeriod] += sampleSize;
        // Increment cases
        cases[currentVar]++;
        // Complete the final weigthed mean
    }

    // Finalize weighted mean
    for(var currentVar in data){
        for(var period in data[currentVar]){
            data[currentVar][period] /= yearlySampleSize[currentVar][period];
        }
    }
    result.push(data);
    this.globalDat = data;
    
    return result;
}

// issue:   Associative array
// _from:   Integer representing starting date
//    to:   Integer representing ending date
// returns an array in which the first value is a process log and the
// second value is an array containing the mood averages.
function solve(issues, _from, to){
    console.log("In solve");
    // Reinitialize global variables for subsequent uses
    nperiods = 0;
    cases = [];
    years = [];
    variable_names = [];
    valid = [];
    sign = [];
    xsmooth = [];
    alpha = 1;
    alphaF = 1;
    mood_forward = {};
    mood_backward = {};
    pIssue = {};
    var e1;
    var pass = 1;
    var std1;
    var mean1;
    var tot1;
    var erel;
    var expprop;
    
    // Build pIssue
    for(var varname in issues){
        if(!this.variable_names.includes(varname)){
            this.variable_names.push(varname);
        }
        for(var period = _from; period <= to; period++){
            if(issues[varname][period] != null){
                if(!(period in this.pIssue)){
                    this.pIssue[period] = {};
                }
                this.pIssue[period][varname] = issues[varname][period];
            }else{
                if(!(period in this.pIssue)){
                    this.pIssue[period] = {};
                }
                this.pIssue[period][varname] = 0;
            }
            // Construct pIssue based on the aggregationPeriod
            var strPeriod = period + "";
            if(aggregationPeriod == "monthly" && strPeriod.substring(4, strPeriod.length) == "12"){
                var year = parseInt(strPeriod.substring(0, 4)) + 1;
                var month = "01";
                period = parseInt(year + month) - 1;
            }else if(aggregationPeriod == "quarterly" && strPeriod.substring(4, strPeriod.length) == "4"){
                var year = parseInt(strPeriod.substring(0, 4)) + 1;
                var quarter = "1";
                period = parseInt(year + quarter) - 1;
            }
        }
    }

    // Fill years array
    for(var key in this.pIssue){
        this.years.push(key);
        this.nperiods++;
    }
    
    var varCases = [];
    var av = [];
    var varStd = [];
    
    for(var i = 0; i < this.variable_names.length; i++){
        var v = this.variable_names[i];
        var nGood = 0;
        var s = 0;
        for(var p = _from; p <= to; p++){
            if(this.pIssue[p] == null){
                continue;
            }
            if(this.pIssue[p][v] != null && this.pIssue[p][v] != 0){
                nGood++;
                s += parseFloat(this.pIssue[p][v]);
            }
        }
        varCases[v] = nGood;
        av[v] = s/nGood;
        varStd[v] = fStdev(this.pIssue, v);
        
        for(p = _from; p <= to; p++){
            if(pIssue[p] == null){
                continue;
            }
            if(this.pIssue[p][v] != null && this.pIssue[p][v] != 0){
                // 100 plus 10 times the z-score
                if(varStd[v] != 0){
                    this.pIssue[p][v] = 100 + 10 * (parseFloat(this.pIssue[p][v]) - av[v]) / varStd[v];
                }else{
                    this.pIssue[p][v] = 100;
                }
            }
        }
        
        this.valid[v] = 1;   // initial values
        this.sign[v] = 1;
        var oldr = [];
        oldr[v] = 1;
    }   // end v

    var iter = 0;
    var tola = .001;
    var converge = 0;
    var lastconv = 99;
    var log_txt = dataCount + " records after date scan.\n"
    if(this.aggregationPeriod == "yearly"){
        var starting = _from;
        var ending = to;
    }else{
        var starting = _from.substring(0, 4) + "." + _from.substring(4, _from.length);
        var ending = to.substring(0, 4) + "." + to.substring(4, to.length);
    }
    log_txt += "Period: " + starting + " to " + ending + " " + "\tTime Points: " + this.nperiods + "\n\n";
    if(smoothing == true){
        log_txt += "Exponential Smoothing: On\n"
    }else{
        log_txt += "Exponential Smoothing: Off\n"
    }
    log_txt += "Aggregation Period: ";
	log_txt += (aggregationPeriod == "yearly") ? "annually\n\n" : (aggregationPeriod + "\n\n");
    log_txt += "Iter\tConverge\tCriterion\tReliability\tAlphaF\tAlphaB\n"
    log_txt += "- - - - - - -\t- - - - - - -\t- - - - - - -\t- - - - - - -\t- - - - - - -\t- - - - - - -\t\n";
    
    var mood_average = {};
    
    while(iter == 0 || converge > tola){ // Master iteration control loop
        // dyad_ratios
        var mood = dyad_ratios(this.pIssue, this.smoothing);
        // calculate average mood
        for(var i = 0; i < this.years.length; i++){
            var year_index = this.years[i];
            if(!isNaN(mood["forward"][year_index]) && !isNaN(mood["backward"][year_index])){
                mood_average[year_index] = (mood["forward"][year_index] + mood["backward"][year_index]) / 2;
            }
        }

        iter++; // Increment iteration count
        var corr = isCorr(this.pIssue, mood_average);
        var converge = 0; 
        var wtmean = 0;
        var wtstd = 0;
        var vsum = 0;
        var evalue = 0;
        var totalvar = 0;
        
        for(var key in this.variable_names){
            var v = variable_names[key];
            // Skip single datapoints
            // (by definition they have no correlation value)
            if(isNaN(corr[v])){
                continue;
            }
            if(corr[v] != null){
                var wn = 0; // Counts how many values are in the current object
                for(var p = _from; p <= to; p++){
                    if(this.pIssue[p] == null){
                        continue;
                    }
                    if(this.pIssue[p][v] != null && this.pIssue[p][v] != 0){
                        wn++;
                    }
                }
                
                var vratio = 0;
                vratio  = wn / this.nperiods;
                evalue += vratio * corr[v] * corr[v];
                totalvar += vratio;

                //convergence test
                if(wn > 3){
                    // largest corr[3] should equal 1.18 or .82?? nope
                    // conv is the convergence test for item v
                    var conv = Math.abs(corr[v] - oldr[v]); 
                    conv = conv * wn / this.nperiods; // weighted by periods
                    if(conv > converge){
                        converge = conv; // converge is max(conv)
                    }
                }
                
                oldr[v] = corr[v];
                this.valid[v] = corr[v] * corr[v];
                wtmean += av[v] * this.valid[v];
                wtstd += varStd[v] * this.valid[v];
                vsum += this.valid[v];
            }
        }
        
        if(vsum > 0){
            wtmean = wtmean / vsum;
            wtstd = wtstd / vsum;
        }
        
        // reliability??
        var fbCorr = fbCor(mood, _from, to);
        
        // Math.round(... * 10000) / 10000 limits the decimal places to 4
//         log_txt += Math.round(iter * 10000) / 10000 + "\t";
//         log_txt += Math.round(converge * 10000) / 10000 + "\t";
//         log_txt += Math.round(tola * 10000) / 10000 + "\t";
//         log_txt += Math.round(fbCorr * 10000) / 10000 + "\t";
//         log_txt += Math.round(this.alphaF * 10000) / 10000 + "\t";
//         log_txt += Math.round(this.alpha * 10000) / 10000 + "\n";
		log_txt += iter.toFixed(3) + "\t";
		log_txt += converge.toFixed(3) + "\t";
		log_txt += tola.toFixed(3) + "\t";
		log_txt += fbCorr.toFixed(3) + "\t";
		log_txt += this.alphaF.toFixed(3) + "\t";
		log_txt += this.alpha.toFixed(3) + "\n";
        
        if(converge > lastconv){
            tola = tola * 2;
        }
        lastconv = converge;
        
        // Emergency shut down of while loop
        if(iter > 50) {
            break;
        }
    } // End iteration control loop
    
    corr = isCorr(this.pIssue, mood_average); // Compute final loadings
    console.log("reached");
    expprop = (evalue / totalvar) * 100; // Exp relative

    var msum = 0;
    var msq = 0;
    
    for(var i = 0; i < this.years.length; i++){
        var year = this.years[i];
        var mfbp = parseFloat(mood_average[year]);
        msum += mfbp;
        msq += mfbp * mfbp;
    }
    
    var moodMean = msum / this.nperiods;
    var sdMood = Math.sqrt((msq / this.nperiods) - moodMean * moodMean);
    
    // Now weighted average metric
    for(var i = 0; i < this.years.length; i++){
        year = this.years[i];
        mood_average[year] = ((parseFloat(mood_average[year]) - moodMean) * wtstd / sdMood) + wtmean;
    }

    log_txt += "\n\nVn\tVariable\tCases\tDim1_Loading\tMean\tStd Deviation\n";
    log_txt += "- - - - - - -\t- - - - - - -\t- - - - - - -\t- - - - - - -\t- - - - - - -\t- - - - - - -\n";
    
    for(var key in this.variable_names){
        if(corr[v] != null){
            var v = variable_names[key];
            var vn = parseInt(key) + 1;
            var count = 0;
            for (var elem in globalDat[v]){
                count++
            }
            log_txt += vn + "\t" + v + "\t" + count + "\t" + corr[v].toFixed(3) + "\t" + av[v].toFixed(3) + "\t" + varStd[v].toFixed(3) + "\n";
        }
    }
    
    log_txt += "\n\nEigen Esimate " + Math.round(evalue * 1000) / 1000 + " of possible " + Math.round(totalvar * 1000) / 1000 + "\n";
    log_txt += "Pct Variance explained: " + Math.round(expprop * 1000) / 1000 + "%\n";
    log_txt += "\nMean:\t" + Math.round(wtmean * 1000) / 1000 + "\nStd Deviation:\t" + Math.round(wtstd * 1000) / 1000 + "\n";
    
    var outRec = [];
    outRec.push(log_txt);
    outRec.push(mood_average);
    return outRec;
}
    
//      data: An array holding the variales by year
// smoothing: A boolean value stating whether or not smoothing is to be done
// Returns an associative array containing the smoothing of the data going forward
// and the smoothing going backward.
function dyad_ratios(data, smoothing){
    console.log("In dyad_ratios");
    var mood = {forward:[], backward:[]};
    
    // Forward
    this.alpha = 1;
    this.alphaF = 1;
    
    this.mood_forward[this.years[0]] = 100;
    
    var firstj = 2;
    var lastj = this.nperiods;
    
    var cd = lastj - firstj + 1;
    var jprev = 1;
    
    var j = firstj;
    
    while(cd > 0){
        cd --;
        
        var year = this.years[j - 1];
        
        var variables = data[this.years[j - 1]];
        
        this.mood_forward[year] = 0;
        var everlap = 0; // Number of years that have contributed sums to the mood
        
        var firstj2 = 1;
        var lastj2 = j - 1;
        
        for(var j2 = firstj2; j2 <= lastj2; j2++){
            var compare_year = this.years[j2 - 1];
            compare_variables = data[this.years[j2 - 1]];
            
            var sum = 0;
            var consum = 0; // Sum of commonalities across issues
            var overlap = 0;
            
            for(var key in this.variable_names){
                var v = this.variable_names[key];
                var xj = variables[v]; // base year value
                var sngx2 = compare_variables[v]; // comparison of year values
            
                if(xj != null && sngx2 != null && xj != 0 && sngx2 != 0){
                    overlap++; // Number of issues contributing to the sum
                    var ratio = xj / sngx2;
                    if (this.sign[v] < 0){
                        ratio = 1 / ratio;
                    }
                    
                    sum += this.valid[v] * ratio * parseFloat(this.mood_forward[compare_year]);
                    consum += this.valid[v];
                }
            }
            
            if(overlap > 0){
                everlap++;
                this.mood_forward[year] += sum / consum;
            }
        }
        
        if(everlap > 0){
            this.mood_forward[year] = parseFloat(this.mood_forward[year]) / everlap;
        }else{
            this.mood_forward[year] = this.mood_forward[this.years[jprev - 1]];
        }
        
        jprev = j;
        j++;
    }
    
    // Smoothing forward
    
    if(smoothing){
        this.alpha = eSmooth(this.mood_forward, this.alpha);
        
        var fVectSm = [];
        
        for(var tm = 0; tm < this.nperiods - 1; tm++){
            fVectSm[tm] = parseFloat(this.mood_forward[this.years[tm]]);
        }
        
        for(var tm = 1; tm <= this.nperiods - 1; tm++){
            fVectSm[tm] = this.alpha * parseFloat(this.mood_forward[this.years[tm]]) + (1 - this.alpha) * fVectSm[tm - 1];
        }
        
        for(var tm = 0; tm <= this.nperiods - 1; tm++){
            this.mood_forward[this.years[tm]] = fVectSm[tm];
        }
    }
    
    // End forward
    
    // Backward
    this.alphaF = this.alpha;
    
    this.mood_backward[this.years[this.nperiods - 1]] = this.mood_forward[this.years[this.nperiods - 1]];    
    var firstj = nperiods - 1;
    var lastj = 1;
    cd = firstj - lastj + 1;
    jprev = this.nperiods;
    var j = firstj;
    
    while(cd > 0){
        cd--;
        var year = this.years[j - 1];
        var variables = data[this.years[j - 1]];
        
        this.mood_backward[year] = 0;
        var everlap = 0;
        
        firstj2 = j + 1;
        lastj2 = this.nperiods;
        
        for(var j2 = firstj2; j2 <= lastj2; j2++){
            var compare_year = this.years[j2 - 1];
            var compare_variables = data[this.years[j2 - 1]];
            var sum = 0;
            var consum = 0; // Sum of commonalities across issues
            var overlap = 0;
            
            for(var key in this.variable_names){
                var v = this.variable_names[key];
                var xj = variables[v];
                var sngx2 = compare_variables[v]; // Comparison year value
                
                if(xj != null && sngx2 != null && xj != 0 && sngx2 != 0){
                    overlap++; // Number of issues contributing to sum
                    var ratio = xj / sngx2;
                    if(this.sign[v] < 0){
                        ratio = 1 / ratio;
                    }
                    sum += this.valid[v] * ratio * parseFloat(this.mood_backward[compare_year]);
                    consum += this.valid[v];
                }
            }
            
            if(overlap > 0){
                everlap++;
                this.mood_backward[year] = parseFloat(this.mood_backward[year]) + sum / consum;
            }
        }
        if(everlap > 0){
            this.mood_backward[year] = parseFloat(this.mood_backward[year]) / everlap;
        }else{
            this.mood_backward[year] = this.mood_backward[this.years[jprev - 1]];
        }
        jprev = j;
        j--;
    }
    
    // Smoothing backward
    
    if(smoothing){
        this.alpha = eSmooth(this.mood_backward, this.alpha);
        
        var fVectSm = [];
        
        for(var tm = 0; tm < this.nperiods - 1; tm++){
            fVectSm[tm] = parseFloat(this.mood_backward[this.years[tm]]);
        }
        
        for(var tm = 1; tm <= this.nperiods - 1; tm++){
            fVectSm[tm] = this.alpha * parseFloat(this.mood_backward[this.years[tm]]) + (1 - this.alpha) * fVectSm[tm - 1];
        }
        
        for(var tm = 0; tm <= this.nperiods - 1; tm++){
            this.mood_backward[this.years[tm]] = fVectSm[tm];
        }
    }
    
    mood["forward"] = this.mood_forward;
    mood["backward"] = this.mood_backward;
    return mood;
}

function fStdev(pIssue, v){ // Calculates stdev for *pIssue and divides by N
    console.log("In fStdev");
    var s = 0;
    var n = this.nperiods;
    var nGood = 0;
    
    for(var j = 0; j < n; j++){
        if(pIssue[this.years[j]][v] != null && pIssue[this.years[j]][v] != 0){
            nGood++;
            s += parseFloat(pIssue[this.years[j]][v]);
        }
    }

    var ave = s / nGood; // Mean
    s = 0;
    
    for(var j = 0; j < n; j++){
        if(pIssue[this.years[j]][v] != null && pIssue[this.years[j]][v] != 0){
            var dev = parseFloat(pIssue[this.years[j]][v]) - ave;
            s += dev * dev;
        }
    }
    
    var variance = s / nGood; // Variance
    var sdev = Math.sqrt(variance); // Standard Deviation
    return sdev;
}

function fbCor(mood, _from, to){
    console.log("In fbCor");
    var ncases = 0;
    var ax = 0;
    var ay = 0;
    for(var p = _from; p <= to; p++){
        if(mood["forward"][p] == null || mood["backward"][p] == null){
            continue;
        }
        ncases++;
        ax += parseFloat(mood["forward"][p]);
        ay += parseFloat(mood["backward"][p]);
    }
    ax = ax / ncases;
    ay = ay / ncases;
    
    var sxx = 0;
    var sxy = 0;
    var syy = 0;
    var xt = 0;
    var yt = 0;
    for(var p = _from; p <= to; p++){
        if(mood["forward"][p] == null || mood["backward"][p] == null){
            continue;
        }
        xt = mood["forward"][p] - ax;
        yt = mood["backward"][p] - ay;
        sxx += xt * xt;
        syy += yt * yt;
        sxy += xt * yt;
    }
    
    var correlation = sxy/Math.sqrt(sxx * syy);
    return correlation;
}

//       pIssue:   a 2D array containing the dataset
// average_mood:   an array containing the average mood values per year
// returns an array in which the first value is a process log and the
// second value is an array containing the mood averages.
function isCorr(pIssue, average_mood){
    console.log("In isCorr");
    var arr_return = [];
    //for(var v in this.variable_names){
    for(var k = 0; k < this.variable_names.length; k++){
        var v = this.variable_names[k];
        var sxx = 0;
        var sxy = 0;
        var syy = 0;
        var ax = 0;
        var ay = 0;
        var ncases = 0;
        
        for(var year in average_mood){
            if(pIssue[year][v] != null && pIssue[year][v] != 0){
                ncases++;
                ax += parseFloat(pIssue[year][v]);
                ay += parseFloat(average_mood[year]);
            }
        }
        
        ax /= ncases; // xbar
        ay /= ncases; // ybar
        
        for(var year in average_mood){
            if(pIssue[year][v] != null && pIssue[year][v] != 0){
                var xt = parseFloat(pIssue[year][v]) - ax;
                var yt = parseFloat(average_mood[year]) - ay;
                sxx += xt * xt;
                syy += yt * yt;
                sxy += xt * yt;
            }
        }
        
        arr_return[v] = sxy / Math.sqrt(sxx * syy);
            
        if(arr_return[v] < 0){ 
            this.sign[v] = -1;
        }else{
            this.sign[v] = 1;
        }
    }
    return arr_return;
}

//  mood:   An array containing mood values
// alpha:   The original alpha value
// returns a single value representing the smoothed alpha value
function eSmooth(mood, alpha){ // Removed &mood because the mood is now global
    console.log("In eSmooth");
    var div = document.getElementById('result');
    var lb = 0.5; // Lower bound
    var ub = 1; // Uper bound
    var low = lb; // The alpha value corresponding to the lowest SumSq
    var high = ub; // The alpha value corresponding to the highest SumSq
    var ssCrit = 0.001; // Exit condition
    var deltInc = 0.0002; // Incrementor
    var sumSq = 0;
    var ssInit = 0;
    var oldss = 0;
    var relSum = 0;
    var setD;
    
    var vectAlpha = [];
    var sum = [];
    var dist = [];
    var x = [];
    
    if(alpha > 0){
        alpha = 0.5;
    }
    
    vectAlpha[1] = lb;
    vectAlpha[2] = 0.75;
    vectAlpha[3] = ub;
    for(var ap = 1; ap <= 3; ap++){ // For ap = 1 to 3 : ap is alpha pointer
        // Smooth
        alpha = vectAlpha[ap];
        x[1] = parseFloat(mood[this.years[0]]);
        
        for(var l = 2; l <= this.nperiods; l++){
            x[l] = alpha * parseFloat(mood[this.years[l - 1]]) + (1 - alpha) * x[l - 1];
        }
        
        sumSq = 0;        
        for(var l = 3; l <= this.nperiods; l++){
            var fError = parseFloat(mood[this.years[l - 1]]) - x[l - 1];
            sumSq += fError * fError;
        }
        
        sum[ap] = sumSq;
        ssInit = sum[1];
    }
    var it = 0;
    var itExit = false;
    
    while(itExit == false){
        it++;
        // Sort Alphas in ascending order
        for(var l = 1; l <= 3; l++){
            for(var m = l + 1; m <= 3; m++){
                if(vectAlpha[m] < vectAlpha[l]){
                    var tempReal = vectAlpha[m];
                    vectAlpha[m] = vectAlpha[l];
                    vectAlpha[l] = tempReal;
                    tempReal = sum[m];
                    sum[m] = sum[l];
                    sum[l] = tempReal;
                }
            }
        }
        
        var ssR12 = sum[1] - sum[3];
        var ssR23 = sum[2] - sum[3];
        var dInc12 = vectAlpha[2] - vectAlpha[1];
        var dInc23 = vectAlpha[3] - vectAlpha[2];
        
        if(it >= 2){
            if(ssR23 > 0){
                low = vectAlpha[2];
            }else if(ssR12 > 0){
                low = vectAlpha[1];
            }
            if(ssR12 < 0){
                high = vectAlpha[2];
            }else if(ssR23 < 0){
                high = vectAlpha[3];
            }
            
            if(low > lb){
                lb = low;
            }
            if(high < ub){
                ub = high;
            }
        }
        
        if(dInc12 == 0 || dInc23 == 0){
            vectAlpha[4] = 99;
        }else{
            ssR12 = ssR12 / dInc12;
            ssR23 = ssR23 / dInc23;
            var ddssR = Math.abs((ssR23 - ssR12) / (dInc12 + dInc23));
            
            if(it == 1){
                var oldD = vectAlpha[2];
            }else{
                var oldD = vectAlpha[4];
            }
            
            if(ddssR != 0 ){
                vectAlpha[4] = vectAlpha[2] + (((ssR12 + ssR23) / 2) / ddssR) / 2;
            }else{
                vectAlpha[4] = 99;
            }
            
            setD = 0;
        }
        
    // Inbound:
        
        // Select random when in-bounds; resassign when out-of-bounds
        if(vectAlpha[4] < lb || vectAlpha[4] > ub){
            var rNumber = Math.random();
            vectAlpha[4] = lb + rNumber * (ub - lb);
            setD = 1;
        }
        // Find max distance and discard
        for(var l = 1; l <= 3; l++){
            dist[l] = Math.abs(vectAlpha[l] - vectAlpha[4]);
        }
        var max = 1;
        var maxD = dist[1];
        for(var l = 2; l <= 3; l++){
            if(dist[l] > maxD){
                tempReal = maxD;
                maxD = dist[l];
                dist[l] = tempReal;
                max = l;
            }
        }
        vectAlpha[max] = vectAlpha[4];
        ap = max;
        
        if(it == 1){
            oldss = 100;
        }else{
            oldss = 100 * (sumSq / ssInit);
        }
        
        alpha = vectAlpha[ap];
        x[1] = parseFloat(mood[this.years[0]]);
        for(var l = 2; l <= this.nperiods; l++){
            x[l] = alpha * parseFloat(mood[this.years[l - 1]]) + (1 - alpha) * x[l - 1];
        }
        sumSq = 0;
        for(var l = 3; l <= this.nperiods; l++){
            fError = parseFloat(mood[this.years[l - 1]]) - x[l - 1];
            sumSq = sumSq + fError * fError;
        }
        relSum = 100 * (sumSq / ssInit);
        sum[max] = sumSq;
        
        // Rearrange alphas in ascending order
        for(var l = 1; l <= 3; l++){
            for(var m = l + 1; m <= 3; m++){
                if(vectAlpha[m] < vectAlpha[l]){
                    tempReal = vectAlpha[m];
                    vectAlpha[m] = vectAlpha[l];
                    vectAlpha[l] = tempReal;
                    tempReal = sum[m];
                    sum[m] = sum[l];
                    sum[l] = tempReal;
                }
            }
        }
        if(Math.abs(oldss - relSum) < ssCrit && vectAlpha[1] <= 0.995 && vectAlpha[3] > 0.5005){
            itExit = true;
        }
        var paramDif = oldD - vectAlpha[4];
        if(Math.abs(paramDif) < deltInc){
            itExit = true;
        }
        if(Math.abs(ub - lb) < 0.001){
            itExit = true;
        }
        
        var minA = 1;
        var minss = sum[1];
        for(var l = 2; l <= 3; l++){
            if(sum[l] < minss){
                minss = sum[l];
                minA = l;
            }
        }
        ap = minA;
        
        alpha = vectAlpha[ap];
        x[1] = parseFloat(mood[this.years[0]]);
        for(var l = 2; l <= this.nperiods; l++){
            x[l] = alpha * parseFloat(mood[this.years[l - 1]]) + (1 - alpha) * x[l - 1];
        }
        sumSq = 0;
        for(var l = 3; l <= this.nperiods; l++){
            fError = parseFloat(mood[this.years[l - 1]] - x[l - 1]);
            sumSq += fError * fError;
        }
        if((setD == 1) && (it < 51)){
            itExit = false; // reject fake solution
        }
    }
    return vectAlpha[minA];
}
