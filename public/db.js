let at_table = false;
let at_filters = [];
let at_headerNames = [];
$(".at_tab").on("click",function() {
    at_setTab(this.innerHTML.toLowerCase());
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
    at_table = false;
    at_headerNames = data.columnNames;

    tableNamesHolder.innerHTML = "";
    for (let i = 0; i < data.tableNames.length; i++) {
        let div = tableNamesHolder.create("div.at_dc_tableName");
        div.innerHTML = data.tableNames[i];

        div.on("click",function() {
            at_table = this.innerHTML;
            socket.emit("adminTools_loadTable",at_table,at_filters);
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
        select.addEventListener("change", function () {
            console.log(this.value);
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

    if (at_table) {
        socket.emit("adminTools_loadTable",at_table,at_filters);
    }
}
function at_loadDatabaseTable(rows) {
    let table_html = $(".at_dc_table");
    table_html.innerHTML = "";

    if (rows.length == 0) return;

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














































let battlePasses = [];
let selectedPass = false;
$(".addPassButton").on("click",function() {
    battlePasses.push({
        set: [],
        background: "space",
        name: "untitled",

    })
    loadPasses(battlePasses.length - 1);

})
function loadPasses(index) {
    let passHolder = $(".battlePassHolder");
    passHolder.innerHTML = "";
    for (let i = 0; i < battlePasses.length; i++) {
        let div = passHolder.create("div.battlePassDiv");
        div.innerHTML = battlePasses[i].name;
        div.on("click",function() {
            loadPasses(i);
        })
        if (index === i) {
            div.classAdd("battlePassDivSelected");
            selectedPass = battlePasses[i];
            loadRadialPass($(".at_bp_canvas"),selectedPass);
        }
    }
}
function loadRadialPass(holder,pass,unlocked = []) {
    let canvas = holder.create("canvas.battlePassCanvas");
    canvas.stars;
    canvas.techTree_ctx;
    canvas.viewWidth, 
    canvas.viewHeight,
    canvas.offsetX,
    canvas.offsetY,
    canvas.drag = false,
    canvas.startX,
    canvas.startY;
    canvas.laUnlocked;
    canvas.dragSpeed = 0.5;
    canvas.elementDragSpeed = 0.8;
    canvas.spaceSize = 25000; // Huge space
    canvas.mouseDownTime = 0; // Store time of the mousedown event
    canvas.maxClickDuration = 200; // Maximum duration (in ms) for a click to be considered fast

    requestAnimationFrame(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      
        renderRadialPass(canvas,pass,unlocked)
      });

      
    canvas.on('mouseout', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || x > this.clientWidth || y < 0 || y > this.clientHeight) {
            drag = false;
        }
    });
    canvas.body.on("mousedown", (e) => {
        const rect = this.getBoundingClientRect();
        this.drag = true;
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.mouseDownTime = Date.now();
    });
    canvas.body.on("mouseup", (e) => {
        canvas.drag = false;

        const clickDuration = Date.now() - this.mouseDownTime; // Calculate the time between mousedown and mouseup
        if (clickDuration <= maxClickDuration) {
            if (!e.target.classList.contains("techTree_reward") && !e.target.classList.contains("techTree_insideReward")) {
                $(".techTree_reward").classRemove("techTree_reward_selected")
                $(".techTree_infoCard").hide();
            }
        }
    });
    canvas.body.on("mousemove", (e) => {
        if (this.drag) {
            this.offsetX -= (e.clientX - this.startX)*this.dragSpeed;
            this.offsetY -= (e.clientY - this.startY)*this.dragSpeed;

            for (let i = 0; i < this.movingPoints.length; i++) {
                this.movingPoints[i].x += (e.clientX - this.startX)*this.elementDragSpeed;
                this.movingPoints[i].y += (e.clientY - this.startY)*this.elementDragSpeed;
                this.movingPoints[i].div.css({
                    top: this.movingPoints[i].y + "px",
                    left: this.movingPoints[i].x + "px",
                })
            }

            this.startX = e.clientX;
            this.startY = e.clientY;
            drawStars(this);
        }
    });

    
    let vignette = holder.create("div.techTree_vignette");
    let infoCard = holder.create("div.techTree_infoCard");
    infoCard.create("div.infocard_name");
    infoCard.create("div.infocard_title");
    infoCard.create("div.infocard_description")
    canvas.movingPoints = [{
        div: infoCard,
        x: 0,
        y: 0,
    }];
    
    let topLeftContent = holder.create("div.techTree_content");
    let goBackHomeButton = topLeftContent.create("div.techTree_returnButton");
    goBackHomeButton.innerHTML = "Return Home";
    goBackHomeButton.on("click",function() {
        setScene("newMenu")
    })
    let battlePointsImg = topLeftContent.create("img.techTree_battlePointsImg");
    battlePointsImg.src = "img/techTrees/battlePoints.png";
    let battlePointsCounter = topLeftContent.create("div.techTree_battlePointsCounter");
    battlePointsCounter.innerHTML = "x" + localAccount.battlePassPoints;
    generateStarBackground(canvas);
}
function renderRadialPass(canvas,pass,unlocked) {
    let ctx = canvas.getContext("2d");



}


function generateStarBackground(canvas) {
    canvas.viewWidth = window.innerWidth;
    canvas.viewHeight = window.innerHeight;
    canvas.width = canvas.viewWidth;
    canvas.height = canvas.viewHeight;

    canvas.offsetX = (canvas.spaceSize - canvas.viewWidth) / 2;
    canvas.offsetY = (canvas.spaceSize - canvas.viewHeight) / 2;

    const starCount = Math.floor((canvas.spaceSize*15000)/4000); // Number of stars
    canvas.stars = [];

    for (let i = 0; i < starCount; i++) {
        canvas.stars.push({
            x: Math.random() * canvas.spaceSize,
            y: Math.random() * canvas.spaceSize,
            size: Math.random() * 2,
            brightness: Math.random() * 255,
        });
    }

    drawStars(canvas);
}
function drawStars(canvas) {
    let techTree_ctx = canvas.getContext("2d");

    techTree_ctx.fillStyle = "black";
    techTree_ctx.fillRect(0, 0, canvas.viewWidth, canvas.viewHeight);

    techTree_ctx.fillStyle = "white";
    for (let star of canvas.stars) {
        const x = star.x - canvas.offsetX;
        const y = star.y - canvas.offsetY;
        if (x >= 0 && x < canvas.viewWidth && y >= 0 && y < canvas.viewHeight) {
        techTree_ctx.fillStyle = `rgb(${star.brightness}, ${star.brightness}, ${star.brightness})`;
        techTree_ctx.beginPath();
        techTree_ctx.arc(x, y, star.size, 0, Math.PI * 2);
        techTree_ctx.fill();
        }
    }
}