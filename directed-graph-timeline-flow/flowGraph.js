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
            y: 20,
        };

        const dayValues = this.data.nodes.map(d => d.dayMarker);
        const dayValMin = d3.min(dayValues)
        const daySpan = d3.max(dayValues) + Math.abs(dayValMin);
        const xBase = (this.width - this.horizontalMargins * 2 - nodePadding.x * daySpan) / (daySpan + 1);
        const nodeWidth = xBase - nodePadding.x * 2;

        // This is necessary because it applies to text height test nodes and real nodes
        d3.select('body').append('style').html(`
            .flowGraph-node {
                width: ${nodeWidth}px;
                text-align: center;
            }
            p {
                padding: 3px;
            }
            .flowGraph-node p.title {
                font-weight: bolder;
                font-size: 1.15em;
            }
        `)

        // Append titles and text to a div
        // Also, base positioning and stuff on this rather than the other way around
        const testNodes = d3.select('body').append('div')
            .attr('id', 'test-nodes')
            .selectAll('div')
            .data(this.data.nodes)
            .enter().append('div')
            .attr('class', 'flowGraph-node')
            .style('display', 'inline-block')

        testNodes.append('p')
            .attr('class', 'title')
            .html(d => d.title)

        testNodes.append('p')
            .html(d => d.shortDesc)

        const nodeHeight = document.getElementById('test-nodes').offsetHeight
        const yBase = nodeHeight + (nodePadding.y * 2)
        d3.select('#test-nodes').remove()

        this.data.nodes = this.data.nodes.map(d => {
            d.numRepeats = this.data.nodes.filter(node => node.dayMarker === d.dayMarker || node.dayMarker === null).length
            return d;
        })
        .sort((a, b) => a.numRepeats < b.numRepeats)
        const maxNodesForOneDay = this.data.nodes[0].numRepeats;
        // const yBase = (this.height - this.verticalMargins * 2 - nodePadding.y * maxNodesForOneDay) / (maxNodesForOneDay);
        // let nodeHeight = yBase - nodePadding.y * 2;

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

        svg.append('defs')
            .append('marker')
                .attr('id', 'arrowhead')
                .attr('markerWidth', 10)
                .attr('markerHeight', 7)
                .attr('refX', 0)
                .attr('refY', 3.5)
                .attr('orient', 'auto')
                .append('polygon')
                    .attr('points', '0 0, 10 3.5, 0 7')

        const simulation = d3.forceSimulation()
            .force('link', d3.forceLink()
                .id(d => d.id)
            )
            .force('charge', d3.forceCollide())
            .force('center', d3.forceCenter(this.width / 2, this.height / (maxNodesForOneDay + 1)))

        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('path')
            .data(this.data.links)
                .enter().append('path')
                .style('stroke', '#003366')
                .style('stroke-width', '2px')
                .attr('id', d => `linkPath-${d.source}-${d.target}`)

        svg.append('text')
            .selectAll('textPath')
            .data(this.data.links)
            .enter().append('textPath')
                .attr('xlink:href', d => `#linkPath-${d.source}-${d.target}`)
                .attr('startOffset', '47%')
                .html('&#8594')

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
            .style('color', '#003366')
            .append('xhtml:div')
            .attr('class', 'flowGraph-node')

        nodeContent.append('p')
            .attr('class', 'title')
            .html(d => d.title)

        nodeContent.append('p')
            .html(d => d.shortDesc)

        simulation
            .nodes(this.data.nodes)
            .on('tick', ticked);

        simulation.force('link')
            .links(this.data.links);

        function ticked() {

            link.attr('d', function(d) {
                const x1 = d.source.x + nodeWidth / 2;
                const y1 = d.source.y + nodeHeight / 2;
                const x2 = d.target.x + nodeWidth / 2;
                const y2 = d.target.y + nodeHeight / 2;

                return `M ${x1} ${y1} L ${x2} ${y2}`;
            })

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

    renderModal(d) {
        // Given the datum, pop up a modal showing details
        // Modal should have little x in corner that removes it when clicked
    }
}
