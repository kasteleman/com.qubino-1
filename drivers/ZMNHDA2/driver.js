'use strict';

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: false,
	capabilities: {

		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: function (value) {
				return {
					Value: (value > 0) ? 'on/enable' : 'off/disable',
					'Dimming Duration': 1,
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: report => report['Value (Raw)'][0] > 0,
		},

		dim: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: function (value) {
				return {
					Value: value * 100,
					'Dimming Duration': 1,
				};
			},
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: report => report['Value (Raw)'][0] / 100,
		},

		measure_temperature: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: function () {
				return {
					'Sensor Type': 'Temperature (version 1)',
					Properties1: {
						Scale: 0,
					},
				};
			},
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => report['Sensor Value (Parsed)'],
		},

		measure_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: function () {
				return {
					Properties1: {
						Scale: 7,
					},
				};
			},
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2')
				&& report.Properties2.hasOwnProperty('Scale bits 10')
				&& report.Properties2['Scale bits 10'] === 2) {
					return report['Meter Value (Parsed)'];
				} return null;
			},
		},

		meter_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: function () {
				return {
					Properties1: {
						Scale: 0,
					},
				};
			},
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2')
				&& report.Properties2.hasOwnProperty('Scale bits 10')
				&& report.Properties2['Scale bits 10'] === 0) {
					return report['Meter Value (Parsed)'];
				} return null;
			},
		},
	},

	settings:	{
		Input_1_type: {
			index: 1,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		Input_2_contact_type: {
			index: 2,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		Input_3_contact_type: {
			index: 3,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		Deactivate_Activate_ALL_ON__ALL_OFF: {
			index: 10,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		State_of_device_after_power_failure: {
			index: 30,
			size: 1,
			parser: function (input) {
				return new Buffer([(input === true) ? 1 : 0]);
			},
		},
		Power_report_on_power_change: {
			index: 40,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		Power_report_by_time_interval: {
			index: 42,
			size: 2,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		Maximum_dimming_value: {
			index: 61,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		Minimum_dimming_value: {
			index: 60,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)]);
			},
		},
		Dimming_time_soft_on_off: {
			index: 65,
			size: 1,
			parser: function (input) {
				return new Buffer([parseInt(input)] * 100);
			},
		},
		Dimming_time_when_key_pressed: {
			index: 66,
			size: 1,
			parser: function (input) {
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
				const trigger = 'ZMNHDA2_temp_changed';
				const state = report['Sensor Value (Parsed)'];
				const tokens = { ZMNHDA2_temp: report['Sensor Value (Parsed)'] };
				Homey.manager('flow').triggerDevice(trigger, tokens, state, node.device_data);
			}
		});
	}
});

Homey.manager('flow').on('trigger.ZMNHDA2_temp_changed', (callback, args, state) => {
	callback(null, true);
	return;
});
