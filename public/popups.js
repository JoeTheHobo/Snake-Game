
/*
    makePopUp V1 Documentation

    --Parameters--
    elements - Type: Array
    settings - Type: Object

    --Detailed Explanation--
    elements:
        Two Types Of Elements Are
        -Object:
            Add An Element To Current Row/Col
            Example: {type: "button",close: true,cursor: "url('./img/pointer.cur'), auto", background: "red",text:"Discard Changes",onClick: () => {
                        setScene("boardList");
                        loadBoards();
                     }};
            Allowed Settings
            type - title/button - Type Of Element
            close - true/false - If When Clicked will it close the popup
        -Array:

*/

function makePopUp(objects,settings = {}) {
    if ($("sf_popup_" + settings?.id)) return;

    let popup = document.body.create("div");
    popup.className = "popup";
    popup.ids = {};
    if (settings.id) popup.id = "sf_popup_" + settings.id;


    function createObjs(objects,originalHolder,direction,parent,param = (settings.parameter || {})) {
        if (_type(objects).type == "object") objects = [objects];

        let holder = originalHolder.create("div");
        holder.className = "popup_" + direction;

        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];
            if (_type(obj).type == "array") createObjs(obj,holder,direction == "row" ? "col" : "row",parent,param)
            else {
                let div;
                if (["number","input","checkbox"].includes(obj.type)) div = holder.create("input");
                if (["title","button","text"].includes(obj.type)) div = holder.create("div");
                if (obj.text) div.innerHTML = obj.text;

                if (obj.type == "title") {
                    div.css({
                        position: obj.position || "relative",
                        top: obj.top || "auto",
                        right: obj.right || "auto",
                        fontWeight: obj.fontWeight || "auto",
                        width: obj.width || "auto",
                        textAlign: obj.textAlign || "auto",

                        color: obj.color || "white",
                        fontSize: obj.fontSize || "35px",
                        cursor: obj.cursor || "auto",
                        background: obj.background || "none",
                        borderRadius: obj.borderRadius || "none",
                        margin: obj.margin || "10px",
                        padding: obj.padding || "auto",
                        height: obj.height || "auto",
                        lineHeight: obj.lineHeight || "auto",
                        userSelect: obj.userSelect || "none",
                    })
                }
                if (obj.type == "text") {
                    div.css({
                        position: obj.position || "relative",
                        top: obj.top || "auto",
                        right: obj.right || "auto",
                        fontWeight: obj.fontWeight || "auto",
                        width: obj.width || "auto",
                        textAlign: obj.textAlign || "auto",

                        color: obj.color || "white",
                        fontSize: obj.fontSize || "25px",
                        cursor: obj.cursor || "auto",
                        background: obj.background || "none",
                        borderRadius: obj.borderRadius || "none",
                        margin: obj.margin || "10px",
                        padding: obj.padding || "auto",
                        height: obj.height || "auto",
                        lineHeight: obj.lineHeight || "auto",
                        userSelect: obj.userSelect || "none",
                    })
                }
                if (obj.type == "button") {
                    div.css({
                        position: obj.position || "relative",
                        top: obj.top || "auto",
                        right: obj.right || "auto",
                        fontWeight: obj.fontWeight || "auto",
                        width: obj.width || "auto",
                        textAlign: obj.textAlign || "center",

                        color: obj.color || "white",
                        fontSize: obj.fontSize || "25px",
                        cursor: obj.cursor || "pointer",
                        background: obj.background || "black",
                        borderRadius: obj.borderRadius || "5px",
                        margin: obj.margin || "10px",
                        padding: obj.padding || "5px",
                        height: obj.height || "40px",
                        lineHeight: obj.lineHeight || "40px",
                        userSelect: obj.userSelect || "none",
                        border: obj.border || "none",
                    })
                }
                if (obj.type == "checkbox") {
                    div.type = "checkbox";
                    div.checked = obj.value;
                    div.css({
                        width: "30px",
                        height: "30px",
                    })
                }
                if (obj.type == "number") {
                    div.type = "number";
                    
                    if (obj.value) div.value = obj.value;

                    div.css({
                        position: obj.position || "relative",
                        top: obj.top || "auto",
                        right: obj.right || "auto",
                        fontWeight: obj.fontWeight || "auto",
                        width: obj.width || "auto",
                        textAlign: obj.textAlign || "auto",

                        color: obj.color || "black",
                        fontSize: obj.fontSize || "25px",
                        cursor: obj.cursor || "auto",
                        background: obj.background || "white",
                        borderRadius: obj.borderRadius || "5px",
                        margin: obj.margin || "10px",
                        padding: obj.padding || "5px",
                        height: obj.height || "40px",
                        lineHeight: obj.lineHeight || "40px",
                        userSelect: obj.userSelect || "none",

                        outline: obj.outline || "none",

                    })
                    
                    div.style["-webkit-appearance"] = "none"; // For Chrome, Safari, and Edge
                    div.style.MozAppearance = "textfield"; // For Firefox
                    div.style.appearance = "none"; // Standard property

                    div.min = obj.min || false;
                    div.max = obj.max || false;
                    div.on("change",function() {
                        let value = Number(this.value);
                        if (this.min) if (value < this.min) this.value = this.min;
                        if (this.max) if (value > this.max) this.value = this.max;
                    })
                }
                
                if (obj.type == "input") {
                    
                    if (obj.value) div.value = obj.value;
                    if (obj.placeholder) div.placeholder = obj.placeholder;

                    div.css({
                        position: obj.position || "relative",
                        top: obj.top || "auto",
                        right: obj.right || "auto",
                        fontWeight: obj.fontWeight || "auto",
                        width: obj.width || "auto",
                        textAlign: obj.textAlign || "auto",

                        color: obj.color || "black",
                        fontSize: obj.fontSize || "25px",
                        cursor: obj.cursor || "auto",
                        background: obj.background || "white",
                        borderRadius: obj.borderRadius || "5px",
                        margin: obj.margin || "10px",
                        padding: obj.padding || "5px",
                        height: obj.height || "40px",
                        lineHeight: obj.lineHeight || "40px",
                        userSelect: obj.userSelect || "none",
                        display: obj.display || "block",

                        border: obj.border || "none",
                        outline: obj.outline || "none",

                    })
                }

                if (obj.className)
                    div.classAdd(obj.className);

                div.parent = parent;
                if (obj.id) parent.ids[obj.id] = div;
                
                if (obj.onClick) {
                    div.onClickFunc = obj.onClick;
                    div.on("click",function() {
                        this.onClickFunc(this.parent.ids,param,this);
                    });
                }
                if (obj.close) {
                    div.on("click",function() {
                        this.parent.remove();
                    })
                }
            }
            
        }

    }

    createObjs(objects,popup,"col",popup);

    if (settings?.exit) {
        let obj = settings.exit === true ? {} : settings.exit
        let div;
        div = popup.create("div");
        div.innerHTML = "X";
        div.css({
            position: obj.position || "absolute",
            top: obj.top || -23,
            right: obj.right || -23,
            fontWeight: obj.fontWeight || "bold",
            width: obj.width || "50px",
            textAlign: obj.textAlign || "center",
            
            color: obj.color || "rgb(190, 88, 88,1)",
            fontSize: obj.fontSize || "35px",
            cursor: obj.cursor || "pointer",
            background: obj.background || "none",
            borderRadius: obj.borderRadius || "5px",
            margin: obj.margin || "none",
            padding: obj.padding || "none",
            height: obj.height || "50px",
            lineHeight: obj.lineHeight || "50px",
            userSelect: obj.userSelect || "none",
        })

        div.parent = popup;
        div.on("click",function() {
            this.parent.remove();
        })
    }
}