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
            loadRadialPass($(".at_bp_canvas"),selectedPass,[],true);
        }
    }
}
function loadRadialPass(holder,pass,unlocked = [],adminTools = false) {
    holder.innerHTML = "";
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
    canvas.thickness = 70;

    pass.canvas = canvas;
    canvas.points = [];

    requestAnimationFrame(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      
        renderRadialPass(canvas,pass,unlocked,adminTools)
      });

      
    canvas.on('mouseout', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || x > canvas.clientWidth || y < 0 || y > canvas.clientHeight) {
            drag = false;
        }
    });
    canvas.on("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        canvas.drag = true;
        canvas.startX = e.clientX - rect.left;
        canvas.startY = e.clientY - rect.top;
        canvas.mouseDownTime = Date.now();
    });
    canvas.on('click', (e) => {
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;
    
        let thickness = canvas.thickness;
        const squareSize = thickness*0.75;

        let clickedPoint = false;
        canvas.points.forEach((point, index) => {
            // Check if the click is inside the image bounds
            if (mouseX >= point.x && mouseX <= point.x + (squareSize) && mouseY >= point.y && mouseY <= point.y + (squareSize)) {
                selectedNodeId = point.id;
    
                // Redraw images (or adjust their appearance based on selection)
                renderRadialPass2(canvas,selectedPass,[]);
                clickedPoint = true;
            }
        });

        if (clickedPoint) return;

        selectedNodeId = false;
        renderRadialPass2(canvas,selectedPass,[]);
    });
    
    canvas.on("mouseup", (e) => {
        canvas.drag = false;

        const clickDuration = Date.now() - canvas.mouseDownTime; // Calculate the time between mousedown and mouseup
        if (clickDuration <= maxClickDuration) {
            if (!e.target.classList.contains("techTree_reward") && !e.target.classList.contains("techTree_insideReward")) {
                $(".techTree_reward").classRemove("techTree_reward_selected")
                $(".techTree_infoCard").hide();
            }
        }
    });
    canvas.on("mousemove", (e) => {
        if (canvas.drag) {
            const rect = canvas.getBoundingClientRect();
            let realX = e.clientX - rect.left;
            let realY = e.clientY - rect.top
            canvas.offsetX -= (realX - canvas.startX)*canvas.dragSpeed;
            canvas.offsetY -= (realY - canvas.startY)*canvas.dragSpeed;

            for (let i = 0; i < canvas.movingPoints.length; i++) {
                canvas.movingPoints[i].x += (realX - canvas.startX)*canvas.elementDragSpeed;
                canvas.movingPoints[i].y += (realY - canvas.startY)*canvas.elementDragSpeed;
                canvas.movingPoints[i].div.css({
                    top: canvas.movingPoints[i].y + "px",
                    left: canvas.movingPoints[i].x + "px",
                })
            }

            canvas.startX = realX;
            canvas.startY = realY;
            renderRadialPass2(canvas,pass,unlocked);
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
}
function renderRadialPass(canvas,pass,unlocked) {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (pass.background == "space") {
        generateStarBackground(canvas);
    }


    renderRadialPass2(canvas,pass,unlocked);

}
function renderRadialPass2(canvas,pass,unlocked = []) {
    if (pass.background == "space") drawStars(canvas);

    canvas.points = [];
    nodeIndex = 0;
    for (let i = 0; i < pass.set.length; i++) {
        pass_drawRing(canvas,i);
        pass_drawSet(canvas,i,pass.set[i]);
    }

}
let selectedNodeId = false;
let nodeImages = {}
let nodeIndex = 0;
let nodeImageList = ["item","super_tile","tile","skin","reward","chest"];
for (let i = 0; i < nodeImageList.length; i++) {
    let image = new Image();
    image.src = "img/techTrees/" + nodeImageList[i] + "_node.png";
    nodeImages[nodeImageList[i]] = image;
}

function pass_drawSet(canvas, i, set) {
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let thickness = canvas.thickness;
    const squareSize = thickness*0.75;
    const total = set.length;

    if (i === 0) {
        const totalHeight = total * squareSize + (total - 1) * 5;
        const startY = centerY - totalHeight / 2;

        for (let j = 0; j < total; j++) {
            const x = centerX - squareSize / 2;
            const y = startY + j * (squareSize + 5);
            const element = set[j];

            element.index = nodeIndex;

            if (element?.type !== false) {
                drawNodeImage(ctx,nodeImages[element.type],x,y,squareSize,nodeIndex,element);
            } else {
                ctx.fillStyle = 'gray';
                ctx.fillRect(x, y, squareSize, squareSize);
            }
            nodeIndex++;
        }
    } else {
        const radius = (thickness / 2) + (i * thickness);

        for (let j = 0; j < total; j++) {
            const angle = (-Math.PI / 2) + (j * (2 * Math.PI / total));
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const element = set[j];

            element.index = nodeIndex;

            if (element?.type !== false) {
                canvas.points.push({ x: x - squareSize / 2, y: y - squareSize / 2, id: nodeIndex });

                drawNodeImage(ctx,nodeImages[element.type],x - squareSize / 2,y - squareSize / 2,squareSize,nodeIndex,element);

            } else {
                ctx.fillStyle = 'gray';
                ctx.fillRect(x - squareSize / 2, y - squareSize / 2, squareSize, squareSize);
            }
            nodeIndex++;
        }
    }
}
function drawNodeImage(ctx,image,x,y,nodeSize,nodeIndex,element) {
    ctx.drawImage(image, x, y, nodeSize, nodeSize);
    if (selectedNodeId === nodeIndex) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, nodeSize, nodeSize);
    }

    if (element.id !== false) {
        let srcImage = false;
        if (element.type == "item" || element.type == "tile") {
            srcImage = getImage(getById(element.type,element.id),"canvas");
        }

        if (srcImage) {
            let shrinkSize = 0.65;
            let shrinkNodeSize = nodeSize * shrinkSize;
            let shrinkDifference = nodeSize - shrinkNodeSize;

            ctx.drawImage(srcImage, x+(shrinkDifference/2), y+(shrinkDifference/2), shrinkNodeSize, shrinkNodeSize);

        }
    }
}
function pass_drawRing(canvas, i) {
    const ctx = canvas.getContext("2d");
    selected = selectedRing;
    let thickness = canvas.thickness;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (thickness / 2) + (i * thickness);

    // Dynamic blue color
    const maxBlue = 220;
    const step = 10;
    const blue = Math.max(0, maxBlue - i * step);
    let ringColor = `rgba(0, 0, ${blue}, 0.4)`;

    // If selected, draw red fill underneath
    if (i === selected) {
        ringColor = `rgba(0, 255, 0, 0.4)`;
    }

    // Draw the ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = thickness;
    ctx.stroke();
}
function setIdOfNode(nodeID,givenID) {
    for (let i = 0; i < selectedPass.set.length; i++) {
        for (let j = 0; j < selectedPass.set[i].length; j++) {
            let node = selectedPass.set[i][j];
            if (node.index == nodeID) {
                node.id = givenID;
                renderRadialPass2(selectedPass.canvas,selectedPass);
            }
        }
    }
}
let selectedRing = false;
let startWritingNumbers = false;
let writingNumber;

document.body.on("keydown",function(e) {
    if (global_scene !== "adminTools") return;
    if ($("at_battlepassTab").style.background !== 'rgb(137, 69, 192)') return;
    if (!selectedPass) return;

    
    let controlDown = e.ctrlKey;
    let shiftDown = e.shiftKey;
    let altDown = e.altKey;

    if (e.key == "R") {
        selectedPass.set.push([]);
        renderRadialPass2(selectedPass.canvas,selectedPass);
    }
    if (e.key == "Enter" && selectedNodeId !== false && startWritingNumbers) {
        console.log("ID SUBMITTED")
        startWritingNumbers = false;
        setIdOfNode(selectedNodeId,writingNumber);
    }
    if (altDown && selectedNodeId !== false && startWritingNumbers === false) {
        e.preventDefault();
        console.log("Start Writing ID")
        startWritingNumbers = true;
        writingNumber = "";
    }
    if (_type(e.key).isNumber && selectedNodeId !== false && startWritingNumbers) {
        writingNumber += e.key;
        console.log("ID:",writingNumber);
    }
    if (shiftDown && e.code.startsWith("Digit")) {
        selectedRing = Number(e.code.replace("Digit", ""));
        renderRadialPass2(selectedPass.canvas, selectedPass);
    }

    if (controlDown && e.key == "i") {
        e.preventDefault();
        if (selectedRing === false) return;
        selectedPass.set[selectedRing].push({
            type: "item",
            id: false,
        })
        renderRadialPass2(selectedPass.canvas,selectedPass,[]);
    }
    if (controlDown && e.key == "l") {
        e.preventDefault();
        if (selectedRing === false) return;
        selectedPass.set[selectedRing].push({
            type: "tile",
            id: false,

        })
        renderRadialPass2(selectedPass.canvas,selectedPass,[]);
    }
    if (controlDown && e.key == "L") {
        e.preventDefault();
        if (selectedRing === false) return;
        selectedPass.set[selectedRing].push({
            type: "super_tile",
            id: false,

        })
        renderRadialPass2(selectedPass.canvas,selectedPass,[]);
    }
    if (controlDown && e.key == "r") {
        e.preventDefault();
        if (selectedRing === false) return;
        selectedPass.set[selectedRing].push({
            type: "reward",
            id: false,

        })
        renderRadialPass2(selectedPass.canvas,selectedPass,[]);
    }
    if (controlDown && e.key == "s") {
        e.preventDefault();
        if (selectedRing === false) return;
        selectedPass.set[selectedRing].push({
            type: "skin",
            id: false,
        })
        renderRadialPass2(selectedPass.canvas,selectedPass,[]);
    }
    if (controlDown && e.key == "c") {
        e.preventDefault();
        if (selectedRing === false) return;
        selectedPass.set[selectedRing].push({
            type: "chest",
            id: false,
        })
        renderRadialPass2(selectedPass.canvas,selectedPass,[]);
    }

})
function generateStarBackground(canvas) {
    canvas.viewWidth = canvas.width;
    canvas.viewHeight = canvas.height;

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
    techTree_ctx.fillRect(0, 0, canvas.width, canvas.height);

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