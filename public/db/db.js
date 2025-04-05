$(".tab").on("click",function() {
    setTab(this.innerHTML.toLowerCase());
})


function setTab(tabName) {
    $(".content").hide();
    $(".tab").css({
        background: "rgb(223, 223, 223)",
    })
    $(tabName + "Tab").css({
        background: "rgb(137, 69, 192)",
    })
    $(tabName + "Content").show("flex");

    if (tabName == "database") loadDataBaseTab();
}

function loadDataBaseTab() {
    let tableNamesHolder = $(".dc_leftBar");
    let table = $(".dc_table");

}


setTab("database");
