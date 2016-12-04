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
			command_set_parser: value => {
				return {
					'Switch Value': (value > 0) ? 'on/enable' : 'off/disable',
				};
			},
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report['Value'] === 'on/enable',
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
			command_report_parser: report => report['Sensor Value (Parsed)'],
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
		},
		automatic_turning_off_output_q1_after_set_time: {
			index: 11,
			size: 2,
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
						'ZMNHAA2_temp_changed',
						{ ZMNHAA2_temp: report['Sensor Value (Parsed)'] },
						report['Sensor Value (Parsed)'], node.device_data
					);
				}
			});
		}
		if (node.instance.MultiChannelNodes['1']) {
			console.log('ZMNHAA2 I2 triggered');
			node.instance.MultiChannelNodes['1'].CommandClass.COMMAND_CLASS_SENSOR_BINARY.on('report', (command, report) => {
				if (report) {
					console.log('I2 Sensor Binary Report');
					if (report['Sensor Value'] === 'detected an event') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I2_on', {}, {}, node.device_data);
					} else if (report['Sensor Value'] === 'idle') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I2_off', {}, {}, node.device_data);
					}
				}
			});
			node.instance.MultiChannelNodes['1'].CommandClass.COMMAND_CLASS_BASIC.on('report', (command, report) => {
				if (report) {
					console.log('ZMNHAA2 I2 Basic Report');
					if (report['Value'] === 255) {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I2_on', {}, {}, node.device_data);
					} else {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I2_off', {}, {}, node.device_data);
					}
				}
			});
		}
		if (node.instance.MultiChannelNodes['2']) {
			console.log('ZMNHAA2 I3 triggered');
			node.instance.MultiChannelNodes['2'].CommandClass.COMMAND_CLASS_SENSOR_BINARY.on('report', (command, report) => {
				if (report) {
					console.log('I3 Sensor Binary Report');
					if (report['Sensor Value'] === 'detected an event') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I3_on', {}, {}, node.device_data);
					} else if (report['Sensor Value'] === 'idle') {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I3_off', {}, {}, node.device_data);
					}
				}
			});
			node.instance.MultiChannelNodes['2'].CommandClass.COMMAND_CLASS_BASIC.on('report', (command, report) => {
				if (report) {
					console.log('I2 Basic Report');
					if (report['Value'] === 255) {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I3_on', {}, {}, node.device_data);
					} else {
						Homey.manager('flow').triggerDevice('ZMNHAA2_I3_off', {}, {}, node.device_data);
					}
				}
			});
		}
	}
});

Homey.manager('flow').on('trigger.ZMNHAA2_temp_changed', callback => callback(null, true));
Homey.manager('flow').on('trigger.ZMNHAA2_I2_on', callback => callback(null, true));
Homey.manager('flow').on('trigger.ZMNHAA2_I2_off', callback => callback(null, true));
