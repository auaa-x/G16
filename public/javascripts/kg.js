const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit(){
    let type= document.getElementById("myType").value;
    if (type) {
        let config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': selectItem,
        }
        KGSearchWidget(apiKey, document.getElementById("myInput"), config);
        document.getElementById('widget').style.display='block';
        document.getElementById('typeForm').style.display= 'none';
    }
    else {
        alert('Set the type please');
        document.getElementById('widget').style.display='none';
        document.getElementById('resultPanel').style.display='none';
        document.getElementById('typeSet').innerHTML= '';
        document.getElementById('typeForm').style.display= 'block';
    }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event){
    let row= event.row;
    let color = getColor();
    // document.getElementById('resultImage').src= row.json.image.url;
    const result = `
                    <div class='resultPanel' style="width: 50vh; word-break: break-word;padding-left: 10px; border: 2px solid ${color}; margin-bottom: 10px">
                    <h3 id="resultName" style="margin: 10px 0 0 0;">${row.name}</h3>
                    <h4 id="resultId">${'id: '+row.id}</h4>
                    <div id="resultDescription">${row.rc}</div>
                    <div>
                        <a href="${row.qc}" id="resultUrl" target="_blank">
                            Link to Webpage
                        </a>
                    </div>
                </div>
`;
    document.getElementById('resultId').innerHTML += result;
}

/**
 * currently not used. left for reference
 * @param id
 * @param type
 */
function queryMainEntity(id, type){
    const  params = {
        'query': mainEntityName,
        'types': type,
        'limit': 10,
        'indent': true,
        'key' : apiKey,
    };
    $.getJSON(service_url + '?callback=?', params, function(response) {
        $.each(response.itemListElement, function (i, element) {

            $('<div>', {text: element['result']['name']}).appendTo(document.body);
        });
    });
}
