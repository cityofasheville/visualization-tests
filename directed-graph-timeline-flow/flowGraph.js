class FlowGraph{

    /*
     * TODO
     * determine X value by days since start
     * make minimal directed graph after: https://bl.ocks.org/mbostock/3750558, except in v4: https://bl.ocks.org/mbostock/4062045
     * figure out positioning of nodes instead of force layout-- maybe just programmatically "stick" them
     * style graph to look like a flow chart
     * keyboard nav
     */

    constructor(parentElement) {
        this.parentElement = d3.select(parentElement);
        this.width = this.parentElement.style('width').replace('px', '');
        this.height = this.parentElement.style('height').replace('px', '');
        this.verticalMargins = this.height * 0.1;
        this.horizontalMargins = this.width * 0.01;
        // id is assigned to link nodes-- format should be pac1, applicant1, planReview1, etc
        // step is the first place in the process where a step appears-- so if it appears more than once, the first appearance is listed
        /* node format is
        {
            title:,
            id: ,
            firstAppearanceDaysSinceStart: ,
        }, */
        this.data = levelOne;

        this.render()
    }

    render() {
        const xBase = this.width / 16

        const svg = this.parentElement.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.data.links)
                .enter().append("line")
                .style('stroke', 'black')
                .style('stroke-width', '2px')

        const nodeHeight = 100;
        const nodeWidth = 100

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

        // .append("text")
        // .text(function(d) { return d.title; })

        simulation
            .nodes(this.data.nodes.map(d => {
                d.fy = d.id % 1 === 0 ? this.height / 3 : d.fy = this.height / 2 + nodeHeight
                if (d.firstAppearanceDaysSinceStart === null) { d.fy = this.height / 2 + nodeHeight}
                d.fx = xBase * (d.firstAppearanceDaysSinceStart + 2) + this.horizontalMargins
                return d;
            }))
            // .attr("fx", d => xBase * d.firstAppearanceDaysSinceStart)
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
