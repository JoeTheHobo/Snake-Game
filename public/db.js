$(".at_tab").on("click",function() {
    setTab(this.innerHTML.toLowerCase());
})

function at_setTab(tabName) {
    $(".at_content").hide();
    $(".at_tab").css({
        background: "rgb(223, 223, 223)",
    })
    $(tabName + "Tab").css({
        background: "rgb(137, 69, 192)",
    })
    $(tabName + "Content").show("flex");
    
    if (tabName == "database") socket.emit("adminTools_loadDatabase");
}

function at_loadDataBaseTab() {
    let tableNamesHolder = $(".at_dc_leftBar");
    let table = $(".at_dc_table");

}



