$(function() {
    let no_data = `
        <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <i class="fas fa-exclamation" style="font-size: 3rem;"></i>
            <p class="mx-0 my-3">No data available</p>
        </div>
    `

    let spin = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `

    let stockChart = null;

    let currentStock = null;

    //Load data on startup
    $('#search-body').ready(function() {
        let body = $('#search-body');
        body.empty();
        body.append(no_data);
    });
    $('#watch-body').ready(function() {
        let body = $('#watch-body');
        //body.empty();
        //body.append(no_data);
        load_watch()
    });

    $(window).on('resize', function(){
        if(stockChart != null){
            stockChart.resize();
        }
    });

    $('#search-body').on('click', '#search-table tbody tr', function() {
        let current = $(this);
        let symbol = current.find("th").eq(0).html();
        select_stock(symbol);
    });

    $('#watch-body').on('click', '#search-table tbody tr', function() {
        let current = $(this);
        let symbol = current.find("th").eq(0).html();
        select_stock(symbol);
    });

    $('#search-form').on('submit', function(event){
        event.preventDefault();
        search($('#search-field').val());
    });

    $('#stock-form').on('submit', function(event){
        event.preventDefault();
        let btn = $('#stock-btn');
        btn_loading(btn, true);
        update_watch(btn);
    });

    function search(text){
        let body = $('#search-body');
        render_loading(body);

        if(text==''){
            render_search_table(null);
        }else{
            $.ajax({
                url : "stocks/search/",
                type : "POST",
                data : { input : text },
                success : function(json) {
                    let values = json.res;
                    render_search_table(values);
                },
                error : function(xhr,errmsg,err) {
                    console.log(xhr.status + ": " + xhr.responseText);
                }
            });
        }
    }

    function select_stock(symbol){
        currentStock = symbol;

        body = $('#stock-body');
        warning = $('#stock-warning');
        loading = $('#stock-loading');
        title = $('#stock-name');

        warning.hide();
        title.empty();
        body.hide();
        loading.css('display', 'flex');

        $.ajax({
            url : "stocks/get_stock/",
            type : "POST",
            data : {'symbol': symbol},
            success : function(json) {
                let logs = json.logs;
                let watch = json.watch

                loading.hide()
                title.append(`<p class="m-0"><b>${symbol}</b></p>`);

                let database = {
                    'high': [],
                    'low': [],
                    'high-goal': watch!=null?watch['high-goal']:null,
                    'low-goal': watch!=null?watch['low-goal']:null
                }

                $('#low-goal').val(watch!=null?watch['low-goal']:null);
                $('#high-goal').val(watch!=null?watch['high-goal']:null);
                $('#stock-watch').prop('checked', watch!=null);

                for(idx in logs){
                    let log = logs[idx];
                    database['high'].push({t: log['timestamp'], y: log['high']});
                    database['low'].push({t: log['timestamp'], y: log['low']})
                }

                render_chart(database);

                body.show();
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
                loading.hide();
                warning.show();
            }
        });
    }

    function render_search_table(values){
        let element = $('#search-body');
        let html;
        if(values==null || values.length==0){
            html = no_data;
        }else{
            html=`
                <table class="table table-hover" id="search-table">
                    <thead>
                        <tr>
                        <th scope="col">Symbol</th>
                        <th scope="col">Short Name</th>
                        <th scope="col">Long Name</th>
                        </tr>
                    </thead>
                    <tbody>
            `
            for(idx in values){
                let value = values[idx];
                html+=`
                <tr>
                    <th scope="row">${value.symbol}</th>
                    <td>${value.shortname}</td>
                    <td>${value.longname}</td>
                </tr>
                `
            }
            html+=`</tbody></table>`
        }
        element.empty();
        element.append(html);
    }

    function render_watch_table(values){
        let element = $('#watch-body');
        let html;
        if(values==null || values.length==0){
            html = no_data;
        }else{
            html=`
                <table class="table table-hover" id="search-table">
                    <thead>
                        <tr>
                        <th scope="col">Symbol</th>
                        <th scope="col">Name</th>
                        <th scope="col">High</th>
                        <th scope="col">Low</th>
                        </tr>
                    </thead>
                    <tbody>
            `
            for(idx in values){
                let value = values[idx];
                let high_value = parseFloat(value.high).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})
                let low_value = parseFloat(value.low).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})
                html+=`
                <tr>
                    <th scope="row">${value.symbol}</th>
                    <td>${value.name}</td>
                    <td>${high_value}</td>
                    <td>${low_value}</td>
                </tr>
                `
            }
            html+=`</tbody></table>`
        }
        element.empty();
        element.append(html);
    }

    function render_loading(element){
        let loading = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <div class="spinner-border" role="status" style="color: #005984;"></div>
        </div>
        `
        element.empty();
        element.append(loading);
    }

    function btn_loading(element, state){
        if(state){
            element.attr("disabled", true);
            element.empty();
            element.append(spin);
        }else{
            element.removeAttr("disabled");
            element.empty();
            element.append('<i class="fas fa-save"></i>');
        }
    }

    function fitToContainer(canvas){
        canvas.style.width ='100%';
        canvas.style.height='100%';
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function render_chart(database){
        var container = $('#chart-container');
        container.empty();
        container.append('<canvas id="stock-chart"></canvas>');

        var canvas = container.find('canvas')[0];
        fitToContainer(canvas);
        var ctx = canvas.getContext('2d');

        let horizontalLines = null;
        if(database['low-goal'] && database['high-goal']){
            horizontalLines = [
                {
                    lineY: [database['high-goal'], database['high-goal']],
                    lineColor: "rgba(0, 0, 0, 0.7)",
                    text: 'High Goal',
                    textFont: '20px sans-serif',
                    textColor: "rgba(0, 0, 0, 0.7)"
                },
                {
                    lineY: [database['low-goal'], database['low-goal']],
                    lineColor: "rgba(0, 0, 0, 0.7)",
                    text: 'Low Goal',
                    textFont: '20px sans-serif',
                    textColor: "rgba(0, 0, 0, 0.7)"
                }
            ]
        }

        stockChart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "High",
                        data: database['high'],
                        backgroundColor: "rgba(0, 255, 196, 1)",
                        borderColor: "rgba(0, 255, 196, 1)",
                        borderWidth: 1,
                        fill: false,
                        lineTension: 0
                    },
                    {
                        label: "Low",
                        data: database['low'],
                        backgroundColor: "rgba(255, 0, 59, 1)",
                        borderColor: "rgba(255, 0, 59, 1)",
                        borderWidth: 1,
                        fill: false,
                        lineTension: 0
                    },
                ],
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'linear'
                    }]
                },
                responsive: true,
                maintainAspectRatio: false,
                drawHorizontalLine: horizontalLines
            },
        });
          
        Chart.pluginService.register({
            beforeDraw: function(chartInstance, easing) {
                chartInstance.clear();
                var lineOptsArr = chartInstance.options.drawHorizontalLine;
                for (idx in lineOptsArr) {
                    var lineOpts = lineOptsArr[idx];

                    var yAxis = chartInstance.scales["y-axis-0"];
                    var yValueStart = yAxis.getPixelForValue(lineOpts.lineY[0], 0, 0, true);
                    var yValueEnd = yAxis.getPixelForValue(lineOpts.lineY[1], 0, 0, true);
                
                    var ctx = chartInstance.chart.ctx;
                    ctx.save();
                
                    var position = (chartInstance.chartArea.left+chartInstance.chartArea.right)/2;
                    var offset_x = ctx.measureText(lineOpts.text).width/2;
                    var offset_y = ctx.measureText(lineOpts.text).fontBoundingBoxAscent;
                    ctx.font = lineOpts.textFont;
                    ctx.fillStyle = lineOpts.textColor;
                    ctx.fillText(lineOpts.text, position-offset_x, yValueStart+offset_y*2);
                
                    ctx.setLineDash([3,3]);
                    ctx.strokeStyle = lineOpts.lineColor;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(chartInstance.chartArea.left, yValueStart);
                    ctx.lineTo(chartInstance.chartArea.right, yValueEnd);
                    ctx.stroke();
                
                    ctx.restore();
                }
            }
        });
    }

    function update_watch(btn){
        let form = {
            'symbol': currentStock,
            'low': $('#low-goal').val(),
            'high': $('#high-goal').val(),
            'watch': Boolean($('#stock-watch').is(":checked")),
        }
        $.ajax({
            url : "stocks/update_watch/",
            type : "POST",
            data : form,
            success : function() {
                btn_loading(btn, false);
                load_watch();
                select_stock(currentStock);
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    function load_watch(){
        let body = $('#watch-body');
        render_loading(body);
        $.ajax({
            url : "stocks/watched_stocks/",
            type : "POST",
            success : function(json) {
                let values = json.res;
                render_watch_table(values);
            },
            error : function(xhr,errmsg,err) {
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }



    /*
    CSRF header configuration
    */

    // This function gets cookie with a given name
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    //The functions below will create a header with csrftoken
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});