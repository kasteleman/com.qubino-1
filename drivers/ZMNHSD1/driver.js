'use strict';

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: false,
	capabilities: {

		onoff: {
			command_clas: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: function (value) {
					// console.log(JSON.stringify(value));
				return {
					'Value': (value > 0) ? 'on/enable' : 'off/disable',
					'Dimming Duration': 1,
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: function (report) {
				// console.log(JSON.stringify(report));
				return report['Value (Raw)'][0] > 0;
			},
		},

		dim: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: function (value) {
				// console.log(JSON.stringify(value));
				return {
					'Value': value * 100,
					'Dimming Duration': 1,
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: function (report) {
				// console.log(JSON.stringify(report));
				return report['Value (Raw)'][0] / 100;
			},
		},

		measure_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => {
				return {
					'Properties1': {
						'Scale': 7,
					},
				};
			},
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				// console.log(report.Properties2['Scale bits 10']);
				if (report.Properties2['Scale bits 10'] === 2) {
					return report['Meter Value (Parsed)'];
					// console.log(report['Meter Value (Parsed)']);
				} else return null;
			},
		},


		meter_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => {
				return {
					'Properties1': {
						'Scale': 0,
					},
				};
			},
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				// console.log(report.Properties2['Scale bits 10']);
				if (report.Properties2['Scale bits 10'] === 0) {
					return report['Meter Value (Parsed)'];
					// console.log(report['Meter Value (Parsed)']);
				} else return null;
			},
		},
	},

	settings: {
		'Input_1_type': {
			'index': 1,
			'size': 1,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Deactivate/Activate_ALL_ON_/_ALL_OFF': {
			'index': 10,
			'size': 1,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Automatic_turning_off_output_after_set_time': {
			'index': 11,
			'size': 2,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Automatic_turning_on_output_after_set_time': {
			'index': 12,
			'size': 2,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'State_of_device_after_power_failure': {
			'index': 30,
			'size': 1,
			'parser': function (input) {
				return new Buffer([(input === true) ? 1 : 0]);
			},
		},
		'Power_report_on_power_change': {
			'index': 40,
			'size': 1,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Power_report_by_time_interval': {
			'index': 42,
			'size': 2,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Maximum_dimming_value': {
			'index': 61,
			'size': 1,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Minimum_dimming_value': {
			'index': 60,
			'size': 1,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Dimming_time_(soft_on/off)': {
			'index': 65,
			'size': 1,
			'parser': function (input) {
				return new Buffer([parseInt(input)] * 100);
			},
		},
		'Dimming_time_when_key_pressed': {
			'index': 66,
			'size': 1,
			'parser': function (input) {
			 												return new Buffer([parseInt(input)]);
			 	},
		},
	},
});

module.exports.on('initNode', (token) => {

    								const node = module.exports.nodes[token];
    										if (node) {
        										node.instance.CommandClass.COMMAND_CLASS_METER.on('report', (command, report) => {
            										console.log(command);
            										console.log('COMMAND NAME LOG: ' + JSON.stringify(command.name, null, 4));
            										console.log(report);
            										console.log('REPORT LOG: ' + JSON.stringify(report, null, 4));
        });
    }
});
