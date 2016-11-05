'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: true,
	capabilities: {

		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: function (value) {
				return {
					'Switch Value': (value > 0) ? 255 : 0,
				};
			},
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report['Value'] === 'on/enable'
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
			optional: true,
		},
	},

	settings: {
		Input_1_type: {
			index: 1,
			size: 1,
		},
		Input_2_type: {
			index: 1,
			size: 1,
		},
		DeActivate_ALL_ON__ALL_OFF: {
			index: 10,
			size: 1,
		},
		Automatic_turning_off_output_after_set_time: {
			index: 11,
			size: 2,
		},
		Automatic_turning_on_output_after_set_time: {
			index: 12,
			size: 2,
		},
		State_of_device_after_power_failure: {
			index: 30,
			size: 1,
			parser: input => new Buffer([(input === true) ? 1 : 0]),
		},
	},
});

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];

	if (node) {
		if (node.instance.CommandClass.COMMAND_CLASS_SENSOR_MULTILEVEL) {
			node.instance.CommandClass.COMMAND_CLASS_SENSOR_MULTILEVEL.on('report', (command, report) => {
				if (command.name === 'SENSOR_MULTILEVEL_REPORT') {
					Homey.manager('flow').triggerDevice(
						'ZMNHND1_temp_changed',
						{ ZMNHND1_temp: report['Sensor Value (Parsed)'] },
						report['Sensor Value (Parsed)'], node.device_data
					);
				}
			});
		}
	}
});

Homey.manager('flow').on('trigger.ZMNHND1_temp_changed', callback => callback(null, true));
