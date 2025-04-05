let at_filters = [];
let at_headerNames = [];
$(".at_tab").on("click",function() {
    setTab(this.innerHTML.toLowerCase());
})

function at_setTab(tabName) {
    $(".at_content").hide();
    $(".at_tab").css({
        background: "rgb(223, 223, 223)",
    })
    $("at_" + tabName + "Tab").css({
        background: "rgb(137, 69, 192)",
    })
    $("at_" + tabName + "Content").show("flex");
    
    if (tabName == "database") socket.emit("adminTools_loadDatabase");
}

function at_loadDataBaseTab(data) {
    let tableNamesHolder = $(".at_dc_lb_tableNames");
    let table = $(".at_dc_table");
    table.innerHTML = "";
    at_filters = [];
    at_headerNames = data.columnNames;

    tableNamesHolder.innerHTML = "";
    for (let i = 0; i < data.tableNames.length; i++) {
        let div = tableNamesHolder.create("div.at_dc_tableName");
        div.innerHTML = data.tableNames[i];

        div.on("click",function() {
            socket.emit("adminTools_loadTable",this.innerHTML);
        })
    }

    $(".at_dc_columnNames").innerHTML = "";
    for (let i = 0; i < at_headerNames.length; i++) {
        let div = $(".at_dc_columnNames").create("div.at_dc_lb_filter_options");
        div.innerHTML = at_headerNames[i];

        div.on("click",function() {
            at_filters.push({
                name: at_headerNames[i],
                type: "=",
                value: 0,
            })
            at_loadFilters();
            $(".at_dc_columnNames").hide();
        })
    }

    at_loadFilters();

}
function at_loadFilters() {
    let filterSettingsHolder = $(".at_dc_lb_filter");
    filterSettingsHolder.innerHTML = "";

    for (let i = 0; i < at_filters.length; i++) {
        let row = filterSettingsHolder.create("div.at_dc_lb_filter_row");
        let title = row.create("div.at_dc_lb_filter_title");
        title.innerHTML = at_filters[i].name;

        let select = row.create("select.at_dc_lb_filter_select");
        let options = ["=","<",">","<=",">="];
        for (let j = 0; j < options.length; j++) {
            let option = select.create("option");
            option.value = options[j];
            option.innerHTML = options[j];
        }
        select.value = at_filters[i].type;
        select.on("change",function() {
            at_filters[i].type = this.value;
            at_loadFilters();
        })

        let value = row.create("input.at_dc_lb_filter_input");
        value.value = at_filters[i].value;
        value.on("change",function() {
            at_filters[i].value = this.value;
            at_loadFilters();
        })

        let deleteText = row.create("div.at_dc_lb_delete");
        deleteText.innerHTML = "X";
        deleteText.on("click",() => {
            at_filters.splice(i,1);
            at_loadFilters();
        })

    }

    let plus = filterSettingsHolder.create("div.at_dc_lb_filter_plus");
    plus.innerHTML = "+";
    plus.on("click",function() {
        $(".at_dc_columnNames").show("flex");
    })

}
function at_loadDatabaseTable(rows) {
    let table_html = $(".at_dc_table");
    table_html.innerHTML = "";

    let headerNames = Object.keys(rows[0]);

    let headerRow = table_html.insertRow(0);
    for (let i = 0; i < headerNames.length; i++) {
        let headerCol = headerRow.insertCell(i);
        headerCol.innerHTML = headerNames[i];
        headerCol.className = "at_dc_table_header";
    }

    for (let i = 0; i < rows.length; i++) {
        let row = table_html.insertRow(i+1);

        for (let j = 0; j < headerNames.length; j++) {
            let col = row.insertCell(j);
            col.innerHTML = rows[i][headerNames[j]];
            col.className = "at_dc_table_cell" + (i%2);
        }
    }

}



socket.on("adminTools_giveDatabaseData",(data) => {
    at_loadDataBaseTab(data);
})
socket.on("adminTools_giveTableData",(table) => {
    at_loadDatabaseTable(table);
})