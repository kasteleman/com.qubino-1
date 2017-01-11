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
			command_set_parser: value => ({
				'Target Value': (value) ? 'on/enable' : 'off/disable',
				'Duration': 'Default'
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => {
				if (report['Current Value'] === 'on/enable') {
					return true;
				} else if (report['Current Value'] === 'off/disable') {
					return false;
				}
				return null;
			},
		},
		measure_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => ({
				Properties1: {
					Scale: 7,
					'Rate Type': 'Import'
				},
				'Scale 2': 1
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2')
					&& report.Properties2.hasOwnProperty('Scale bits 10')
					&& report.Properties2['Scale bits 10'] === 2) {
					return report['Meter Value (Parsed)'];
				}
				return null;
			},
		},
		meter_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => ({
				Properties1: {
					Scale: 0,
					'Rate Type': 'Import'
				},
				'Scale 2': 1
			}),
			command_report: 'METER_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Properties2')
					&& report.Properties2.hasOwnProperty('Scale bits 10')
					&& report.Properties2['Scale bits 10'] === 0) {
					return report['Meter Value (Parsed)'];
				}
				return null;
			},
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
		automatic_turning_off_ir_output_after_set_time: {
			index: 11,
			size: 2,
		},
		automatic_turning_on_ir_output_after_set_time: {
			index: 12,
			size: 2,
		},
		automatic_turning_off_relay_output_after_set_time: {
			index: 13,
			size: 2,
		},
		automatic_turning_on_relay_output_after_set_time: {
			index: 14,
			size: 2,
		},
		state_of_device_after_power_failure: {
			index: 30,
			size: 1,
			parser: input => new Buffer([(input === true) ? 1 : 0]),
		},
		power_report_on_power_change: {
			index: 40,
			size: 1,
		},
		power_report_by_time_interval: {
			index: 42,
			size: 2,
		},
		enable_disable_endpoints: {
			index: 100,
			size: 1,
		},
	},
});
