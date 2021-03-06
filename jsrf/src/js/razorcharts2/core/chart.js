/**
 *  The main chart object of razorcharts which accepts options and decides which type of chart to create, and renders them
 */

define([
    'vendor/lodash', 
    'razorcharts2/utils/assert',
    'leonardo/leomain',
    'razorcharts2/utils/eventmanager'], function (_, Assert, Leonardo, EventManager) {
    var gaugeXPadding = 0,
        gaugeYPadding = 10,
        xPadding = 20,
        yPadding = 30;
    var Chart =  function () {
        this.options = {};
        this.options.eventManager = new EventManager();
    };
    var charts = {};
    /**
     * Config function for razorcharts
     */
    Chart.prototype.config = function (_options) {
        var self = this;    

        // Override the default options
        this.options = _.extend(this.options, _options);

        self.createAndConfigChart ();
    };

    /**
     * Registers a Chart type
     * @param  {String} key     The name of the wrapper
     * @param  {Function} _chart The chart's constructor 
     */
    Chart.registerChart = function (key, _chart) {
        if(typeof charts[key] === 'undefined') {
            charts[key] = _chart;    
        } else {
           throw "Trying to register a wrapper which already exists";
        }
    };

    /**
     * Finds the correct wrapper based on the options and creates it
     */
    Chart.prototype.createAndConfigChart = function () {
        var options = this.options;
        Assert.assertKey(options, 'type', 'string', 'Chart type not specified');
        Assert.assertKey(charts, options.type, 'string', 'No wrapper with type ' + options.type);
        this.chart = new (charts[options.type])();
        this.chart.config (options);
    };

    /**
     * Renders the chart
     * @param  {HTMLDOMNode} node the DOM node in which the main svg element is to be appended
     * @param  {Number} width  width of the chart
     * @param  {Number} height height of the chart
     */
    Chart.prototype.renderTo = function (node, width, height) {
        var paper = this.paper = Leonardo.paper(node, width, height);
        var core = this.core = paper.g();
        var paddingX,
            paddingY;

        if(this.options.type === 'gauge') {
            paddingX = gaugeXPadding;
            paddingY = gaugeYPadding;
        }
        else {
            paddingX = xPadding;
            paddingY = yPadding;
        }

        core.attr ('id', 'rc-chart-core');
        paper.append(core);
        this.chart.renderTo (paper, core, width - paddingX, height - paddingY);
    };

    /**
     * Resizes the chart
     * @param  {Number} width  width of the chart
     * @param  {Number} height height of the chart
     */
    Chart.prototype.resizeTo = function(width, height) {
        var paddingX,
            paddingY;

        this.paper.attr ({
            width: width,
            height: height
        });

        if(this.options.type === 'gauge') {
            paddingX = gaugeXPadding;
            paddingY = gaugeYPadding;
        }
        else {
            paddingX = xPadding;
            paddingY = yPadding;
        }

        this.chart.resizeTo (width - paddingX, height - paddingY);
    }

    Chart.prototype.update = function (options) {
        this.options = _.extend(this.options, options);
        this.chart.update(options);
    }

    Chart.prototype.on = function(eventName, cb) {
        this.options.eventManager.bind(eventName, cb);
    };

    Chart.prototype.callFunction = function (funcName, argsObject) {
        return this.chart.callFunction (funcName, argsObject);
    };

    return Chart;
});