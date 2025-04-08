function drawXpChart(data) {
    data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let cumulativeXP = 0;
    data.forEach(d => {
        cumulativeXP += d.amount;
        d.cumulativeXP = cumulativeXP;
    });

    const width = 500, height = 350;
    const padding = 50;

    const times = data.map(d => new Date(d.createdAt).getTime());
    const xMin = Math.min(...times), xMax = Math.max(...times);
    const yMin = Math.min(...data.map(d => d.cumulativeXP)), yMax = Math.max(...data.map(d => d.cumulativeXP));

    const xScale = t => padding + ((t - xMin) / (xMax - xMin)) * (width - 2 * padding);
    const yScale = xp => height - padding - ((xp - yMin) / (yMax - yMin)) * (height - 2 * padding);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 500 "+height);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    
    const tooltip = document.getElementById("tooltip");

    for (let i = 0; i < data.length - 1; i++) {
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", xScale(times[i]));
        line.setAttribute("y1", yScale(data[i].cumulativeXP));
        line.setAttribute("x2", xScale(times[i + 1]));
        line.setAttribute("y2", yScale(data[i + 1].cumulativeXP));
        line.setAttribute("stroke", "blue");
        line.setAttribute("stroke-width", 2);
        svg.appendChild(line);
    }

    data.forEach((d, i) => {
        let cx = xScale(times[i]);
        let cy = yScale(d.cumulativeXP);
        x = cx
        y = cy

        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "radarcircle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 5);
        circle.setAttribute("data-time", new Date(d.createdAt).toLocaleString());
        circle.setAttribute("data-xp", d.cumulativeXP);
        svg.appendChild(circle);

        circle.addEventListener("mouseover", (event) => {
            tooltip.style.display = "block";
            tooltip.textContent = `Date: ${circle.getAttribute("data-time")}\nXP: ${circle.getAttribute("data-xp")}`;
        });

        circle.addEventListener("mousemove", (event) => {
            tooltip.style.left = event.pageX + 10 + "px";
            tooltip.style.top = event.pageY + 10 + "px";
        });

        circle.addEventListener("mouseout", () => {
            tooltip.style.display = "none";
        });
    });

    /////////
    let total = document.createElementNS("http://www.w3.org/2000/svg", "text");
    total.setAttribute("x", x-50);
    total.setAttribute("y", y-20);
    total.setAttribute("fill", "#744C02");
    total.textContent = `Total : ${cumulativeXP}`
    svg.appendChild(total);

    document.querySelector(".xpchart").appendChild(svg);
}