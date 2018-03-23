class FlowGraph{

    /*
     * TODO
     * make minimal directed graph after: https://bl.ocks.org/mbostock/3750558, except in v4: https://bl.ocks.org/mbostock/4062045
     * figure out positioning of nodes instead of force layout-- maybe just programmatically "stick" them
     * keyboard nav
     */

    constructor(parentElement) {
        this.parentElement = d3.select(parentElement);
        this.width = this.parentElement.style('width').replace('px', '');
        this.height = this.parentElement.style('height').replace('px', '');
        this.verticalMargins = this.height * 0.01;
        this.horizontalMargins = this.width * 0.01;
        /* node format is
        {
            title:,
            id: ,
            dayMarker: ,
        }, */
        this.data = levelOne;
        this.render()
    }

    render() {
        const nodePadding = 5;
        const dayValues = this.data.nodes.map(d => d.dayMarker);
        const dayValMin = d3.min(dayValues)
        const daySpan = d3.max(dayValues) + Math.abs(dayValMin) + 1;
        const xBase = (this.width - this.horizontalMargins * 2 - nodePadding * daySpan) / daySpan;

        this.data.nodes.map(d => {
            if (d.dayMarker === null) { return; }
            const dayIndex = dayValMin < 0 ? d.dayMarker + Math.abs(dayValMin) : d.dayMarker;
            d.fx = (dayIndex * xBase) + this.horizontalMargins + (dayIndex * nodePadding);
            return d;
        })

        const svg = this.parentElement.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink()
                .id(function(d) { return d.id; })
            )
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.data.links)
                .enter().append("line")
                .style('stroke', 'black')
                .style('stroke-width', '2px')

        const nodeWidth = xBase - nodePadding * 2;
        const nodeHeight = 50;

        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(this.data.nodes)
                .enter().append('g')
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged))
                .append("rect")
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .style('stroke', 'dodgerblue')
                .style('fill', 'white')

        node.append("text")
            .text(function(d) { return d.title; })

        simulation
            .nodes(this.data.nodes.map(d => {
                // console.log(d.fx)
                d.fy = d.id % 1 === 0 ? this.height / 3 : d.fy = this.height / 2 + nodeHeight
                if (d.dayMarker === null) { d.fy = this.height / 2 + nodeHeight}
                return d;
            }))
            // .attr("fx", d => xBase * d.dayMarker)
            .on("tick", ticked);

        simulation.force("link")
            .links(this.data.links);


        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x + nodeWidth / 2; })
                .attr("y1", function(d) { return d.source.y + nodeHeight / 2; })
                .attr("x2", function(d) { return d.target.x + nodeWidth / 2; })
                .attr("y2", function(d) { return d.target.y + nodeHeight / 2; });
            node
                .attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        }


        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

    }
}
