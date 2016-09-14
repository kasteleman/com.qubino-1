'use strict';

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: true,
	capabilities: {

		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: function (value) {
				console.log(JSON.stringify(value));
				return {
					'Value': (value > 0) ? 'on/enable' : 'off/disable',
					'Dimming Duration': 1,
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: function (report) {
				console.log(JSON.stringify(report));
				return report['Value (Raw)'][0] > 0;
			},
		},

		dim: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: function (value) {
				console.log(JSON.stringify(value));
				return {
					'Value': value * 100,
					'Dimming Duration': 1,
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: function (report) {
				console.log(JSON.stringify(report));
				return report['Value (Raw)'][0] / 100;
			},
		},

		measure_temperature: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: function () {
				return {
					'Sensor Type': 'Temperature (version 1)',
					'Properties1': {
						'Scale': 0,
					},
				};
			},
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: function (report) {
				// console.log(JSON.stringify(report));
				return report['Sensor Value (Parsed)'];
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
		'Temperature_sensor_offset': {
			'index': 110,
			'size': 2,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		'Digital_temperature_sensor_reporting': {
			'index': 120,
			'size': 2,
			'parser': function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
	},
});

// bind Flow
module.exports.on('initNode', (token) => {

	const node = module.exports.nodes[token];
	if (node) {
		node.instance.CommandClass.COMMAND_CLASS_SENSOR_MULTILEVEL.on('report', (command, report) => {
			if (command.name === 'SENSOR_MULTILEVEL_REPORT') {
				console.log('Flow: New report value came in');
				console.log(node.device_data);
				console.log(report['Sensor Value (Parsed)']);
				const trigger = 'ZMNHVD1_temp_changed';
				const state = report['Sensor Value (Parsed)'];
				const tokens = { 'ZMNHVD1_temp': report['Sensor Value (Parsed)'] };
				Homey.manager('flow').triggerDevice(trigger, tokens, state, node.device_data);
			}
		});
	}
});

Homey.manager('flow').on('trigger.ZMNHVD1_temp_changed', (callback, args, state) => {
	callback(null, true);
	return;
});
