class FlowGraph{

    constructor(parentElement, inputData = levelOne) {
        this.parentElement = d3.select(parentElement);
        this.width = this.parentElement.style('width').replace('px', '');
        this.height = this.parentElement.style('height').replace('px', '');
        this.verticalMargins = this.height * 0.015;
        this.horizontalMargins = this.width * 0.015;
        this.data = inputData;
        this.render()
    }

    render() {
        const nodePadding = {
            x: 7.5,
            y: 5,
        };

        const dayValues = this.data.nodes.map(d => d.dayMarker);
        const dayValMin = d3.min(dayValues)
        const daySpan = d3.max(dayValues) + Math.abs(dayValMin);
        const xBase = (this.width - this.horizontalMargins * 2 - nodePadding.x * daySpan) / (daySpan + 1);
        const nodeWidth = xBase - nodePadding.x * 2;

        // Append titles and text to a div
        // TODO: abstract this and the other method somewhere-- this is hacky and terrible
        const testNodes = d3.select('body').append('div')
            // .style('display', 'none')
            .attr('id', 'test-node')
            .selectAll('div')
            .data(this.data.nodes)
            .enter().append('div')
            .style('display', 'inline-block')
            .style('width', `${nodeWidth}px`)
            .style('text-align', 'center')

        testNodes.append('p')
            .html(d => d.title)
            .style('font-weight', 'bolder')
            .style('font-size', '1.15em')

        testNodes.append('p')
            .html(d => d.shortDesc)

        testNodes.selectAll('p').style('padding', '3px')


        this.data.nodes = this.data.nodes.map(d => {
            d.numRepeats = this.data.nodes.filter(node => node.dayMarker === d.dayMarker || node.dayMarker === null).length
            return d;
        })
        .sort((a, b) => a.numRepeats < b.numRepeats)
        const maxNodesForOneDay = this.data.nodes[0].numRepeats;
        const yBase = (this.height - this.verticalMargins * 2 - nodePadding.y * maxNodesForOneDay) / (maxNodesForOneDay);
        let nodeHeight = yBase - nodePadding.y * 2;

        this.data.nodes.map(d => {
            if (d.dayMarker === null) { return d; }
            const dayIndex = dayValMin < 0 ? d.dayMarker + Math.abs(dayValMin) : d.dayMarker;
            d.fx =  this.horizontalMargins + (dayIndex * xBase) + ((dayIndex + 1) * nodePadding.x);

            const nodeLevel = d.id.split('.')[1]
            // Top aligned:
            // d.fy = this.verticalMargins + (nodeLevel * yBase) + ((+nodeLevel + 1) * nodePadding.y);

            // Center aligned:
            d.fy = (this.height / 2)  - (yBase * (d.numRepeats / 2.0)) + (nodeLevel * yBase)

            return d;
        })

        const svg = this.parentElement.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('tabindex', 0)

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
                .style('stroke', '#003366')
                .style('stroke-width', '3px')


        const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(this.data.nodes)
                .enter().append('g')
                .style('cursor', 'pointer')
                .on('mouseover', function() {
                    d3.select(this).select('.nodeShape').style('fill', '#cce5ff')
                })
                .on('mouseout', function() {
                    d3.select(this).select('.nodeShape').style('fill', '#e6f2ff')
                })
                // .call(d3.drag()
                //     .on('start', dragstarted)
                //     .on('drag', dragged))

        node.append('rect')
            .attr('class', 'nodeShape')
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('rx', '15')
            .attr('ry', '15')
            .style('stroke', '#003366')
            .style('stroke-width', '0.1')
            .style('fill', '#e6f2ff')

        const nodeContent = node.append('foreignObject')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .style('text-align', 'center')
            .style('color', '#003366')
            .append('xhtml:div')
            .attr('id', d => d.id)
            .attr('width', `${nodeWidth}px`)

        nodeContent
            .append('p')
            .html(d => d.title)
            .style('font-weight', 'bolder')
            .style('font-size', '1.15em')

        nodeContent.append('p')
            .html(d => d.shortDesc)

        const tallestNode = document.getElementById('test-node').offsetHeight
        nodeHeight = tallestNode

        d3.selectAll('rect, foreignObject').attr('height', `${nodeHeight}px`)

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
