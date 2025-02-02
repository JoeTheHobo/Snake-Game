let renderEmotesList = [];
class Emote {
    constructor(attach,settings) {
        this.id = Date.now() + rnd(5000);
        renderEmotesList.push(this);

        this.attach = attach;
        this.ctx = ctx_top;
        this.pos = attach.pos;
        this.frame = 0;
        this.realPos;
        this.getRealPos();

        this.showIfPlayerDis = settings?.showIfPlayerDis || false;
        this.show = true;
        this.hideIfBoardStatusPass = settings?.hideIfBoardStatusPass || false;
    }
    update() {
        this.frame++;
        this.getRealPos();
        this.playerProxPass();
        if (this.hideIfBoardStatusPass && this.show) this.checkBoardStatus();
    }
    getRealPos() {
        this.realPos = {
            x: this.pos.x*gridSize+(gridSize/2),
            y: this.pos.y*gridSize,
        }
    }
    playerProxPass() {
        if (_type(this.showIfPlayerDis).type !== "number") return;
        this.show = false;
        for (let i = 0; i < activePlayers.length; i++) {
            let player = activePlayers[i];
            let dis = calculateDistance(this.pos.x,this.pos.y,player.pos.x,player.pos.y);
            if (dis <= this.showIfPlayerDis) this.show = true;
        }
    }
    checkBoardStatus() {
        let worldStatusPass = false;
        let boardStatusCount = 0;
        for (let i = 0; i < this.attach.boardDestructible.length; i++) {
            if (this.attach.boardDestructible[i] == "yes")  {
                worldStatusPass = true;
                boardStatusCount++;
                continue;
            }
            if (currentBoard.boardStatus.includes(this.attach.boardDestructible[i])) {
                for (let j = 0; j < currentBoard.boardStatus.length; j++) {
                    if (currentBoard.boardStatus[j] === this.attach.boardDestructible[i]) boardStatusCount++;
                }
                continue;
            }
        }
        worldStatusPass = boardStatusCount >= Number(this.attach.boardDestructibleCountRequired);
        if (worldStatusPass) this.show = false;
    }
    finish() {
        for (let i = 0; i < renderEmotesList.length; i++) {
            if (renderEmotesList[i].id === this.id) renderEmotesList.splice(i,1);
        }
    }
}


class messageEmote extends Emote { 
    constructor(attach,text,settings) {
        super(attach,settings);
        this.text = text;
        this.padding = settings?.messagePadding || 10;
    }
    animate() {
        this.update();
        if (!this.show) return; 
        drawTextBubble(this.ctx,this.realPos.x,this.realPos.y,this.text,200,this.padding);
    }
}


function renderEmotes() {
    ctx_top.clearRect(0,0,canvas_top.width,canvas_top.height);
    for (let i = 0; i < renderEmotesList.length; i++) {
        let emote = renderEmotesList[i];
        emote.animate();
    }
}

function drawTextBubble(ctx, x, y, text, maxWidth = 200, padding = 10, radius = 10) {
    ctx.font = "16px Arial";
    let lineHeight = 20; // Space between lines
    let words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    // Handle text wrapping
    for (let i = 1; i < words.length; i++) {
        let testLine = currentLine + " " + words[i];
        let testWidth = ctx.measureText(testLine).width;
        if (testWidth < maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);

    let textWidth = Math.min(maxWidth, Math.max(...lines.map(line => ctx.measureText(line).width)));
    let textHeight = lines.length * lineHeight;
    
    let bubbleWidth = textWidth + padding * 2;
    let bubbleHeight = textHeight + padding * 2;
    let triangleSize = 10; // Size of the bottom triangle
    
    let bubbleX = x - bubbleWidth / 2;
    let bubbleY = y - bubbleHeight - triangleSize;

    // Draw speech bubble with rounded corners
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(bubbleX + radius, bubbleY);
    ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
    ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
    ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + bubbleWidth / 2 + triangleSize, bubbleY + bubbleHeight);
    ctx.lineTo(x, y);
    ctx.lineTo(bubbleX + bubbleWidth / 2 - triangleSize, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
    ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius);
    ctx.lineTo(bubbleX, bubbleY + radius);
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw text inside the bubble
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let textX = x;
    let textY = bubbleY + padding + lineHeight / 2;

    for (let line of lines) {
        ctx.fillText(line, textX, textY);
        textY += lineHeight;
    }
}