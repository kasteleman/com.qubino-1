'use strict';

const path = require('path');
const ZwaveDriver = require('node-homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: true,
	capabilities: {
		windowcoverings_state: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: (value, node) => {
				let result = 'off/disable';

				// Check correct counter value in case of idle
				if (value === 'idle') {
					if (node.state.position === 'on/enable') result = 'off/disable';
					else if (node.state.position === 'off/disable') result = 'on/enable';
				} else if (value === 'up') {
					result = 'on/enable';
				}

				// Save latest known position state
				if (node && node.state) {
					node.state.position = result;
				}

				return {
					'Switch Value': result
				};
			},
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: (report, node) => {

				// Save latest known position state
				if (node && node.state) {
					node.state.position = report['Value']
				}

				switch (report['Value']) {
					case 'on/enable':
						return 'up';
					case 'off/disable':
						return 'down';
					default:
						return 'idle';
				}
			}
		},
		measure_power: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => report['Sensor Value (Parsed)']
		}
	},
	settings: {
		all_on_all_off: {
			index: 10,
			size: 2
		},
		power_report_on_power_change: {
			index: 40,
			size: 1
		},
		power_report_by_time_interval: {
			index: 42,
			size: 2
		},
		operating_modes: {
			index: 71,
			size: 1
		},
		slats_tilting_full_turn_time: {
			index: 72,
			size: 2
		},
		slats_position: {
			index: 73,
			size: 1
		},
		motor_moving_up_down_time: {
			index: 74,
			size: 2
		},
		motor_operation_detection: {
			index: 76,
			size: 1
		},
		forced_shutter_calibration: {
			index: 78,
			size: 1
		},
		power_reporting_to_controller: {
			index: 80,
			size: 1
		},
		power_consumption_max_delay_time: {
			index: 85,
			size: 1
		},
		power_consumption_at_limit_switch_delay_time: {
			index: 86,
			size: 1
		},
		delay_time_between_outputs: {
			index: 90,
			size: 1
		},
		temperature_sensor_offset_settings: {
			index: 110,
			size: 2
		},
		digital_temperature_sensor_reporting: {
			index: 120,
			size: 1
		}
	}
}