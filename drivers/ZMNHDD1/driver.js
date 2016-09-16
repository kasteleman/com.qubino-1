'use strict';

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: false,
	capabilities: {

		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: function (value) {
				return {
					'Switch Value': value,
				};
			},
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report['Value (Raw)'] === 'on/enable',
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
		Time_Unit: {
			index: 15,
			size: 1,
		},
		State_of_device_after_power_failure: {
			index: 30,
			size: 1,
		},
		Output_Switch_selection: {
			index: 63,
			size: 1,
		},
	},
});
