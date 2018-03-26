class FlowGraph{

    /*
     * TODO
     * make minimal directed graph after: https://bl.ocks.org/mbostock/3750558, except in v4: https://bl.ocks.org/mbostock/4062045
     * figure out positioning of nodes instead of force layout-- maybe just programmatically 'stick' them
     * keyboard nav
     */

    constructor(parentElement) {
        this.parentElement = d3.select(parentElement);
        this.width = this.parentElement.style('width').replace('px', '');
        this.height = this.parentElement.style('height').replace('px', '');
        this.verticalMargins = this.height * 0.05;
        this.horizontalMargins = this.width * 0.025;
        this.data = levelOne;
        this.render()
    }

    render() {
        const nodePadding = 5;
        const dayValues = this.data.nodes.map(d => d.dayMarker);
        const dayValMin = d3.min(dayValues)
        const daySpan = d3.max(dayValues) + Math.abs(dayValMin);
        const maxNodesForOneDay = this.data.nodes.map(d => d.dayMarker)
            .filter((d, i, dayMarkerArray) => dayMarkerArray.indexOf(d) === i)
            .map(d => {
                return {
                    dayMarker: d,
                    numRepeats: this.data.nodes.filter(node => node.dayMarker === d).length
                }
            })
            .sort((a, b) => a.numRepeats < b.numRepeats)[0].numRepeats

        const xBase = (this.width - this.horizontalMargins * 2 - nodePadding * daySpan) / (daySpan + 1);
        const yBase = (this.height - this.verticalMargins * 2 - nodePadding * maxNodesForOneDay) / (maxNodesForOneDay);
        const nodeWidth = xBase - nodePadding * 2;
        const nodeHeight = yBase - nodePadding * 2;

        this.data.nodes.map(d => {
            if (d.dayMarker === null) { return d; }
            const dayIndex = dayValMin < 0 ? d.dayMarker + Math.abs(dayValMin) : d.dayMarker;
            d.fx =  this.horizontalMargins + (dayIndex * xBase) + ((dayIndex + 1) * nodePadding);
            const nodeLevel = d.id.split('.')[1]
            d.fy = this.verticalMargins + (nodeLevel * yBase) + ((+nodeLevel + 1) * nodePadding);
            return d;
        })

        const svg = this.parentElement.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)

        const simulation = d3.forceSimulation()
            .force('link', d3.forceLink()
                .id(d => d.id)
            )
            .force('charge', d3.forceCollide())
            .force('center', d3.forceCenter(this.width / 2, this.height / (maxNodesForOneDay + 1)))

        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.data.links)
                .enter().append('line')
                .style('stroke', 'black')
                .style('stroke-width', '3px')


        const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(this.data.nodes)
                .enter().append('g')
                // .call(d3.drag()
                //     .on('start', dragstarted)
                //     .on('drag', dragged))

        node.append('rect')
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('rx', '15')
            .attr('ry', '15')
            .style('stroke', 'dodgerblue')
            .style('stroke-width', '3')
            .style('fill', '#e6f2ff')


        const nodeContent = node.append('foreignObject')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .style('padding', `0 ${nodeWidth * 0.025}`)
            .style('text-align', 'center')
            .append('xhtml:div')

        nodeContent.append('p')
            .html(d => d.title)
            .style('font-weight', 'bold')

        nodeContent.append('p')
            .html('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')

        simulation
            .nodes(this.data.nodes)
            .on('tick', ticked);

        simulation.force('link')
            .links(this.data.links);

        function ticked() {
            link
                .attr('x1', function(d) { return d.source.x + nodeWidth / 2; })
                .attr('y1', function(d) { return d.source.y + nodeHeight / 2; })
                .attr('x2', function(d) { return d.target.x + nodeWidth / 2; })
                .attr('y2', function(d) { return d.target.y + nodeHeight / 2; });

            node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');
        }

        simulation.alphaTarget(1).restart()

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
