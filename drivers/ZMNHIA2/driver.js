'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Documentation: https://www.domotica-shop.nl/files/images/Manuals/Qubino%20manuals/Qubino_Flush_On-Off_thermostat_user%20manual_V1_0_eng.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		custom_thermostat_mode: {
			command_class: 'COMMAND_CLASS_THERMOSTAT_MODE',
			command_get: 'THERMOSTAT_MODE_GET',
			command_set: 'THERMOSTAT_MODE_SET',
			command_set_parser: mode => ({
				'Level': {
					'Mode': (mode === 'off') ? 'Off' : 'Auto',
				},
			}),
			command_report: 'THERMOSTAT_MODE_REPORT',
			command_report_parser: report => {
				if (report && report.hasOwnProperty('Level') &&
					report['Level'].hasOwnProperty('Mode') &&
					typeof report['Level']['Mode'] !== 'undefined') {
					return report['Level']['Mode'].toLowerCase();
				}
				return null;
			},
		},
		target_temperature: {
			command_class: 'COMMAND_CLASS_THERMOSTAT_SETPOINT',
			command_get: 'THERMOSTAT_SETPOINT_GET',
			command_get_parser: () => ({
				'Level': {
					'Setpoint Type': 'Heating 1',
				}
			}),
			command_set: 'THERMOSTAT_SETPOINT_SET',
			command_set_parser: (value) => {

				// Create value buffer
				const a = new Buffer(2);
				a.writeUInt16BE((Math.round(value * 2) / 2 * 10).toFixed(0));

				return {
					'Level': {
						'Setpoint Type': 'Heating 1'
					},
					'Level2': {
						'Size': 2,
						'Scale': 0,
						'Precision': 1
					},
					'Value': a
				};
			},
			command_report: 'THERMOSTAT_SETPOINT_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Level2')
					&& report.Level2.hasOwnProperty('Scale')
					&& report.Level2.hasOwnProperty('Precision')
					&& report.Level2['Scale'] === 0
					&& report.Level2['Size'] !== 'undefined'
					&& typeof report['Value'].readUIntBE(0, report.Level2['Size']) !== 'undefined') {
					return report['Value'].readUIntBE(0, report.Level2['Size']) / Math.pow(10, report.Level2['Precision']);
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
			command_report_parser: report => report['Sensor Value (Parsed)'],
			optional: true,
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
		input_3_type: {
			index: 3,
			size: 1,
		},
		input_2_contact_type: {
			index: 4,
			size: 1,
		},
		input_3_contact_type: {
			index: 5,
			size: 1,
		},
		input_2_set_point: {
			index: 11,
			size: 2,
			signed: false,
		},
		input_3_set_point: {
			index: 12,
			size: 2,
			signed: false,
		},
		state_of_device_after_power_failure: {
			index: 30,
			size: 1,
		},
		power_report_on_power_change: {
			index: 40,
			size: 1,
		},
		power_report_by_time_interval: {
			index: 42,
			size: 2,
			signed: false,
		},
		temperature_hysteresis_on: {
			index: 43,
			size: 1,
			signed: false,
		},
		temperature_hysteresis_off: {
			index: 44,
			size: 1,
			signed: false,
		},
		antifreeze: {
			index: 45,
			size: 1,
			signed: false,
		},
		too_low_temperature_limit: {
			index: 60,
			size: 2,
		},
		too_high_temperature_limit: {
			index: 61,
			size: 2,
		},
		output_switch_selection: {
			index: 63,
			size: 1,
		},
	},
});
