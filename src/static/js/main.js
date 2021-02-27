$(function() {
    let no_data = `
        <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <i class="fas fa-exclamation" style="font-size: 3rem;"></i>
        <p class="mx-0 my-3">No data available</p>
        </div>
    `

    $('#search-body').ready(function() {
        let body = $('#search-body');
        body.empty();
        body.append(no_data);
    });

    $('#stock-view').ready(function() {
        let body = $('#stock-view');
        body.empty();
        body.append(no_data);
    });



    $('#search-body').on('click', '#search-table tbody tr', function() {
        let current = $(this);
        let symbol = current.find("th").eq(0).html();
        console.log(symbol);
        $('#stock-view').empty();
        $('#stock-view').append(symbol);
    });

    $('#search-form').on('submit', function(event){
        event.preventDefault();
        search($('#search-field').val());
    });

    function search(text){
        let body = $('#search-body');
        render_loading(body);

        if(text==''){
            render_table(body, null);
        }else{
            $.ajax({
                url : "stocks/search/",
                type : "POST",
                data : { input : text },
                success : function(json) {
                    let values = json.res;
                    render_table(body, values);
                },
                error : function(xhr,errmsg,err) {
                    console.log(xhr.status + ": " + xhr.responseText);
                }
            });
        }
    }

    function render_table(element, values){
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

    function render_loading(element){
        let loading = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <div class="spinner-border" role="status" style="color: #005984;"></div>
        </div>
        `
        element.empty();
        element.append(loading);
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