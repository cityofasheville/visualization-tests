class BarChart {

    // TODO:
        // use aria or a11y or whatever, change data set to include details, attach those details with data binding
        // fix deprecation warning-- use setTargetAtTime rather than GainNode.gain.value

	constructor(parentElement) {
		this.parentElement = d3.select(parentElement)
		this.width = this.parentElement.style('width').replace('px', '')
		this.height = this.parentElement.style('height').replace('px', '')
        this.verticalMargins = 40
        this.horizontalMargins = 20
        this.originalTimeDomain = [new Date(1990, 1), new Date(2017, 1)]
        this.graphWidth = this.width - this.horizontalMargins * 2
        this.graphHeight = this.height - this.verticalMargins * 2

        this.context = new AudioContext()

        this.histX = d3.scaleTime()
            .domain(this.originalTimeDomain)
            .rangeRound([this.horizontalMargins, this.graphWidth]);

        this.histLayout = d3.histogram()
            .thresholds(this.histX.ticks(this.graphWidth / 10))

        const dataToUse = this.makeData();
        this.xData = this.histLayout(dataToUse);

        const yMin = d3.min(this.xData, d => d.length);
        const yMax = d3.max(this.xData, d => d.length);

        this.y = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([0, this.graphHeight]);

        this.pitchY = function(numInBar) {
            // Try to make it fit into western harmonic expectations if it can
            const actualMax = (yMax - yMin) < 36 ? (parseInt(yMax / 12) + 12) : (yMax - yMin)
            const span = Math.min(actualMax, 36)

            const n = d3.scaleLinear()
                .domain([0, actualMax])
                .range([0, span]);

            return 220 * Math.pow(Math.pow(2, 1/span), n(numInBar))
        }

        this.xData.map(d => d.pitch = this.pitchY(d.length))

        this.draw()

        this.bars = d3.selectAll('.bar').nodes() // should be selection of all bars
        this.highlightedBarIndex = 0

        const self = this
        d3.select('body').on('keydown', function() {
            self.handleArrowKey()
        })
        this.handleArrowKey()

        // rapid key presses create sound only?  or user can switch between overview vs detail mode?
	}

    addGraphAlt() {
        // Bar graph with x axis showing [label] and y axis showing [label].
        // Span of values on x axis is [domain], span of values on y axis is [domain].
        // Mean, median, mode, max, min

    }

    handleArrowKey() {
        const pushed = d3.event ? d3.event.keyCode : 0
        const volumeScale = d3.scaleLinear().domain([100, 1500]).range([2, .3]);
        d3.select(this.bars[this.highlightedBarIndex]).classed('highlighted', false)

        if (pushed === 37) {
            this.highlightedBarIndex -= 1
        } else if (pushed === 39) {
            this.highlightedBarIndex += 1
        }

        const numBars = this.bars.length
        this.highlightedBarIndex = this.highlightedBarIndex < 0 ? numBars + this.highlightedBarIndex : this.highlightedBarIndex % numBars;

        const highlightedBar = d3.select(this.bars[this.highlightedBarIndex])
        
        highlightedBar.classed('highlighted', true)

        const self = this
        highlightedBar.attr('d', function(d) {
            // Audio functionality from: http://bl.ocks.org/aholachek/6e18a82c0f0ada144b854f788c07d7a4
            const oscillator = self.context.createOscillator();
            const gainNode = self.context.createGain();
            gainNode.gain.value = volumeScale(d.pitch);
            oscillator.type = 'triangle';
            oscillator.frequency.value = d.pitch; // Hz
            // Connect the oscillator to our speakers after passing it
            // through the gainNode to modulate volume
            oscillator.connect(gainNode);
            gainNode.connect(self.context.destination);
            // Start the oscillator now
            oscillator.start();
            // this rapidly ramps sound down
            gainNode.gain.setTargetAtTime(0, self.context.currentTime, .3);
        })
        /*
        TODO:
            make tooltip that works with mouse or keyboard
        */
    }


    draw(inputData) {
        const svg = this.parentElement.append('svg')
            .attr('position', 'absolute')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('width', this.width)
            .attr('height', this.height)

        const xAxis = d3.axisBottom()
            .scale(this.histX)
            .ticks(d3.timeYear, 1)
            .tickFormat(d => `${new Date(d).toLocaleDateString('en-US', {year: 'numeric'})}`);

        const barGroup = svg.append('g')
            .attr('class', 'bar-group')

        const bars = barGroup.selectAll('.bar')
            .data(this.xData);

        bars.exit()
            .transition()
            .duration(750)
            .attr('height', 0);

        const padding = this.graphWidth / this.xData.length * 0.1 
        const barWidth = this.graphWidth / this.xData.length - padding

        const self = this

        bars.enter().append('rect')
            .attr('class', 'bar')
            .attr('y',  d => this.verticalMargins + this.graphHeight - this.y(d.length))
            .attr('height', d => this.y(d.length))
            .attr('width', barWidth)
            .attr('transform', d => `translate(${self.histX(d.x1) + padding}, 0)`)

        // bars.transition()
        //     .duration(750)
        //     .attr('height', d => this.y(d.length));

        const xAxisElements = svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0 ${this.graphHeight + this.verticalMargins})`)
            .call(xAxis);

        xAxisElements.selectAll('path, line')
            .style('shape-rendering', 'crispEdges');
    }

    // update(inputData) {

    //     // TODO: FIX THIS
    //     const self = this;
    //     let dataToUse = self.makeData();

    //     const newXData = self.histLayout(dataToUse);

    //     // Max height should be large enough to see the buckets where there is only one;
    //     // but small enough that it looks like bars have changed when they have
    //     const yMax = Math.max(d3.max(newXData, d => d.length), 16 / 2);

    //     const y = d3.scaleLinear()
    //         .domain([0, yMax])
    //         .range([self.graphHeight, 0]);

    //     const bars = d3.selectAll('.bar')
    //         .data(newXData);

    //     bars.exit().attr('height', 0);

    //     bars.transition()
    //         .duration(750)
    //         .attr('height', d => y(d.length))
    //         .attr('y',  d => self.verticalMargins + self.graphHeight - y(d.length))

    // }

    makeData(length = 400) {
        return new Array(length).fill({}).map(function() {
            const year = Math.random() * (2017 - 1990) + 1990;
            const month = Math.random() * (12 - 1) + 1;
            const day = Math.random() * (30 - 1) + 1;
            const hours = Math.random() * 23;
            const minutes = Math.random() * 59 + 1;
            return new Date(year, month, day, hours, minutes);
        }).sort((a, b) => a - b)
    }
}