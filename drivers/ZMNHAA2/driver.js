'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Documentation: http://www.benext.eu/static/manual/qubino/flush-1-relay-ZMNHAA2.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
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
				if (report['Value'] === 'on/enable') {
					return true;
				} else if (report['Value'] === 'off/disable') {
					return false;
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
		measure_power: {
			command_class: 'COMMAND_CLASS_METER',
			command_get: 'METER_GET',
			command_get_parser: () => ({
				Properties1: {
					Scale: 7,
				},
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
				},
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
		input_2_type: {
			index: 2,
			size: 1,
		},
		deactivate_ALL_ON_ALL_OFF: {
			index: 10,
			size: 2,
			signed: false,
		},
		automatic_turning_off_output_q1_after_set_time: {
			index: 11,
			size: 2,
			signed: false,
		},
		state_of_device_after_power_failure: {
			index: 30,
			size: 1,
			parser: input => new Buffer([(input === true) ? 1 : 0]),
		},
		power_report_on_power_change_q1: {
			index: 40,
			size: 1,
		},
		power_report_by_time_interval_q1: {
			index: 42,
			size: 2,
			signed: false,
		},
	},
});

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];

	if (node) {

		// I2 switched
		if (node.instance.MultiChannelNodes['1'].CommandClass.COMMAND_CLASS_SENSOR_BINARY) {
			node.instance.MultiChannelNodes['1'].CommandClass.COMMAND_CLASS_SENSOR_BINARY.on('report', (command, report) => {
				if (command.name === 'SENSOR_BINARY_REPORT') {
					if (report['Sensor Value'] === 'detected an event') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I2_on', {}, {}, node.device_data);
					} else if (report['Sensor Value'] === 'idle') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I2_off', {}, {}, node.device_data);
					}
				}
			});
		}

		// I3 switched
		if (node.instance.MultiChannelNodes['2'].CommandClass.COMMAND_CLASS_SENSOR_BINARY) {
			node.instance.MultiChannelNodes['2'].CommandClass.COMMAND_CLASS_SENSOR_BINARY.on('report', (command, report) => {
				if (command.name === 'SENSOR_BINARY_REPORT') {
					if (report['Sensor Value'] === 'detected an event') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I3_on', {}, {}, node.device_data);
					} else if (report['Sensor Value'] === 'idle') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I3_off', {}, {}, node.device_data);
					}
				}
			});
		}
	}
});
