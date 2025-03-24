

function loadShopMenu() {
    $(".menu_tab").classRemove("menu_tab_selected");
    $(".menu_content").hide();
    $(".content_shop").show("flex");
    $("shop_tab").classAdd("menu_tab_selected");

}