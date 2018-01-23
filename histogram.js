class Histogram {

    // TODO:
        // use aria or a11y or whatever, change data set to include details, attach those details with data binding
        // fix deprecation warning-- use setTargetAtTime rather than GainNode.gain.value
        // add title?
        // make grouped bar for nested data
        // add labeled by and described by
        // what is expected data format?
        // media query for high contrast mode?
        // make tooltip that works with mouse or keyboard

	constructor(parentElement, inputData, xKey) {
		this.parentElement = d3.select(parentElement)
        inputData√.sort((a, b) => a - b)


		this.width = this.parentElement.style('width').replace('px', '')
		this.height = this.parentElement.style('height').replace('px', '')
        this.verticalMargins = this.height * 0.1
        this.horizontalMargins = this.width * 0.1

        this.originalTimeDomain = [new Date(1990, 1), new Date(2017, 1)]

        this.graphWidth = this.width - this.horizontalMargins * 2
        this.graphHeight = this.height - this.verticalMargins * 2

        this.context = new AudioContext()

        this.histX = d3.scaleTime()
            .domain(this.originalTimeDomain)
            .rangeRound([0, this.graphWidth]);

        this.histLayout = d3.histogram()
            .thresholds(this.histX.ticks(this.graphWidth / 10))

        this.xData = this.histLayout(inputData);

        const yMin = d3.min(this.xData, d => d.length);
        const yMax = d3.max(this.xData, d => d.length);

        this.y = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([0, this.graphHeight]);

        this.xData.map(function(d) {
            const actualMax = (yMax - yMin) < 36 ? (parseInt(yMax / 12) + 12) : (yMax - yMin)
            const span = Math.min(actualMax, 36)
            const n = d3.scaleLinear()
                .domain([0, actualMax])
                .range([0, span]);
            d.pitch = 220 * Math.pow(Math.pow(2, 1/span), n(d.length))
        })

        this.draw()
        this.bars = d3.selectAll('.bar').nodes() // should be selection of all bars
        this.highlightedBarIndex = null
        this.parentElement.on('keydown', () => this.handleArrowKey())
	}

    addGraphAlt() {
        // Bar graph with x axis showing [label] and y axis showing [label].
        // Span of values on x axis is [domain], span of values on y axis is [domain].
        // Mean, median, mode, max, min
    }

    handleBarFocus(data, index) {
        this.highlightedBarIndex = index
        const highlightedBar = d3.select(this.bars[index])
        const volumeScale = d3.scaleLinear().domain([100, 1500]).range([2, .3]);

        d3.selectAll(this.bars)
            .classed('highlighted', false)
            .attr('tabindex', '-1')
        
        highlightedBar
            .classed('highlighted', true)
            .attr('tabindex', '0')

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

    }

    handleArrowKey() {
        const pushed = d3.event.keyCode
        const volumeScale = d3.scaleLinear().domain([100, 1500]).range([2, .3]);

        if (pushed != 37 && pushed != 39) return;

        if (this.highlightedBarIndex === null) {
            // If this is the first time a user has pressed an arrow key
            this.highlightedBarIndex = 0
        } else if (pushed === 37) {
            this.highlightedBarIndex -= 1
        } else if (pushed === 39) {
            this.highlightedBarIndex += 1
        }

        const numBars = this.bars.length;
        // If subtracting one made it negative, go to the last bar
        this.highlightedBarIndex = this.highlightedBarIndex < 0 ? numBars + this.highlightedBarIndex : this.highlightedBarIndex % numBars;
        this.bars[this.highlightedBarIndex].focus()
    }


    draw(inputData) {
        const svg = this.parentElement.append('svg')
            .attr('position', 'absolute')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('role', 'group')
            .attr('tabindex', '0')

        const xAxis = d3.axisBottom()
            .scale(this.histX)
            .ticks(d3.timeYear, 1)
            .tickFormat(d => `${new Date(d).toLocaleDateString('en-US', {year: 'numeric'})}`);

        const barGroup = svg.append('g')
            .attr('class', 'bar-group')
            .attr('role', 'list') // so that screen readers will announce number of items in list
            .attr('aria-label', 'bar graph')
            .attr('tabindex', '0')

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
            .attr('role', 'listitem') // so screen reader will know it's in the list
            .attr('tabindex', '-1')
            .attr('aria-label', function(d) {
                return `X value range: ${self.prettyFormatDate(d.x0)} to ${self.prettyFormatDate(d.x1)}.  Y value: ${d.length}.`
            })
            .attr('y',  d => this.verticalMargins + this.graphHeight - this.y(d.length))
            .attr('height', d => this.y(d.length))
            .attr('width', barWidth)
            .attr('transform', d => `translate(${this.histX(d.x0) + padding + this.horizontalMargins}, 0)`)
            .on('focus', (d, i) => this.handleBarFocus(d, i))
            .on('blur', function() {
                d3.select(this)
                    .classed('highlighted', false)
                    .attr('tabindex', '-1')
            })

        const xAxisElements = svg.append('g')
            .attr('role', 'presentation')
            .attr('aria-hidden', 'true')
            .attr('class', 'x axis')
            .attr('transform', `translate(${this.horizontalMargins} ${this.graphHeight + this.verticalMargins})`)
            .call(xAxis);

        xAxisElements.selectAll('*')
            .attr('role', 'presentation')
            .attr('aria-hidden', 'true')

        xAxisElements.selectAll('path, line')
            .style('shape-rendering', 'crispEdges');
    }

    // update(inputData) {

    //     // TODO: FIX THIS
    //     const self = this;
    //     const newXData = self.histLayout(inputData);

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

    prettyFormatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long'})
    }
}