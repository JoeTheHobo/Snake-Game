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
    let tableNamesHolder = $(".at_dc_leftBar");
    let table = $(".at_dc_table");
    table.innerHTML = "";

    tableNamesHolder.innerHTML = "";
    for (let i = 0; i < data.tableNames.length; i++) {
        let div = tableNamesHolder.create("div.at_dc_tableName");
        div.innerHTML = data.tableNames[i];

        div.on("click",function() {
            socket.emit("adminTools_loadTable",this.innerHTML);
        })
    }

}
function at_loadDatabaseTable(rows) {
    let table_html = $(".at_dc_table");
    table_html.innerHTML = "";

    let headerNames = Object.keys(rows[0]);

    let headerRow = table_html.insertRow(0);
    for (let i = 0; i < headerNames.length; i++) {
        let headerCol = headerRow.insertCell(i);
        headerCol.innerHTML = headerNames[i];
    }

}



socket.on("adminTools_giveDatabaseData",(data) => {
    at_loadDataBaseTab(data);
})
socket.on("adminTools_giveTableData",(table) => {
    console.log(table);
    at_loadDatabaseTable(table);
})