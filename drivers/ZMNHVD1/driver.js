'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Documentation: http://qubino.com/download/996/

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: true,
	capabilities: {
		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: value => ({
				'Switch Value': (value) ? 'on/enable' : 'off/disable',
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => {
				if (report.Value === 'on/enable') {
					return true;
				} else if (report.Value === 'off/disable') {
					return false;
				}
				return null;
			},
		},
		dim: {
			command_class: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			command_get: 'SWITCH_MULTILEVEL_GET',
			command_set: 'SWITCH_MULTILEVEL_SET',
			command_set_parser: value => ({
				Value: Math.round(value * 99),
				'Dimming Duration': 255,
			}),
			command_report: 'SWITCH_MULTILEVEL_REPORT',
			command_report_parser: (report, node) => {
				if (report && report['Value (Raw)']) {
					console.log(node.state.onoff);
					if (typeof report !== 'undefined' && typeof report.Value === 'string') {
						return (report.Value === 'on/enable') ? 1.0 : 0.0;
					}
					// Setting on/off state when dimming
					if (!node.state.onoff || node.state.onoff !== (report['Value (Raw)'][0] > 0)) {
						node.state.onoff = (report['Value (Raw)'][0] > 0);
						console.log(node.state.onoff);
						module.exports.realtime(node.device_data, 'onoff', (report['Value (Raw)'][0] > 0));
					}
					if (report['Value (Raw)'][0] === 255) return 1;
					return report['Value (Raw)'][0] / 99;
				}
				return null;
			},
		},
		measure_temperature: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Temperature (version 1)',
				Properties1: {
					Scale: 0,
				},
			}),
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report['Sensor Value (Parsed)'] === -999.9) return null;
				return report['Sensor Value (Parsed)'];
			},
			optional: true,
		},
	},
	settings: {
		input_1_type: {
			index: 1,
			size: 1,
		},
		deactivate_ALL_ON_ALL_OFF: {
			index: 10,
			size: 2,
		},
		automatic_turning_off_output_after_set_time: {
			index: 11,
			size: 2,
		},
		automatic_turning_on_output_after_set_time: {
			index: 12,
			size: 2,
		},
		state_of_device_after_power_failure: {
			index: 30,
			size: 1,
		},
		maximum_dimming_value: {
			index: 61,
			size: 1,
		},
		minimum_dimming_value: {
			index: 60,
			size: 1,
		},
		dimming_time_soft_on_off: {
			index: 65,
			size: 1,
		},
		dimming_time_when_key_pressed: {
			index: 66,
			size: 1,
		},
		temperature_sensor_offset: {
			index: 110,
			size: 2,
		},
		digital_temperature_sensor_reporting: {
			index: 120,
			size: 2,
		},
	},
});
