function drawRadar(skills){

    const svg = document.getElementById("radarChart");
    const centerX = 200, centerY = 200, maxRadius = 120;
    const numLevels = 5;
    const angleStep = (2 * Math.PI) / Object.keys(skills).length;
    
    function createElement(tag, attributes) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (let attr in attributes) {
            element.setAttribute(attr, attributes[attr]);
        }
        return element;
    }

    function drawGrid() {
        for (let i = 1; i <= numLevels; i++) {
            let radius = (maxRadius / numLevels) * i;
            svg.appendChild(createElement("circle", {
                cx: centerX, cy: centerY, r: radius
            }));
        }
    }

    function drawCenterLines() {
        let i = 0;
        for (let skill in skills) {
            let angle = i * angleStep - Math.PI / 2;
            let x = centerX + maxRadius * Math.cos(angle);
            let y = centerY + maxRadius * Math.sin(angle);
            svg.appendChild(createElement("line", {
                x1: centerX, y1: centerY, x2: x, y2: y
            }));
            i++;
        }
    }

    function drawLabels() {
        let i = 0;
        for (let skill in skills) {
            let angle = i * angleStep - Math.PI / 2;
            let x = centerX + (maxRadius + 20) * Math.cos(angle);
            let y = centerY + (maxRadius + 20) * Math.sin(angle);
            let text = createElement("text", { x, y, "text-anchor": x > centerX ? "start" : "end" });
            text.id = "skillText"
            text.textContent = `${skill.replace('skill_','')} (${skills[skill]}%)`;
            svg.appendChild(text);
            i++;
        }
    }

    function drawSkillData() {
        let points = "";
        let i = 0;
        for (let skill in skills) {
            let normalizedValue = skills[skill] / 100;
            let radius = normalizedValue * maxRadius;
            let angle = i * angleStep - Math.PI / 2;
            let x = centerX + radius * Math.cos(angle);
            let y = centerY + radius * Math.sin(angle);
            points += `${x},${y} `;
            i++;
        }
        let polygon = createElement("polygon", { points: points.trim() });
        svg.appendChild(polygon);
    }

    function drawRadarChart() {
        drawGrid();
        drawCenterLines();
        drawLabels();
        drawSkillData();
    }

    drawRadarChart();
}