/**
 * Application initialization
 *
 * @package    Ongage\JS
 * @category   **CATEGORY**
 * @author     Rafi Bodill <rafi@sortex.co.il>
 * @copyright  Copyright (C) 2010 - 2012 Ongage, LTD. All rights reserved.
 * @license    Ongage, 2010-2012
 * @link       http://www.ongage.com
 */

$(function() {
	
	var $body = $('body');

	// Set datepicker defaults
	$.datepicker.setDefaults({
		dateFormat: 'dd-mm-yy',
		// disable future dates
		maxDate: new Date,
		numberOfMonths: 1,
		showButtonPanel: false,
		showOn: 'button',
		buttonImage: App.media_base+'img/icons/date-icon.png',
		buttonImageOnly: true,
		buttonText: 'Pick a date',
		duration: 'fast',
		showAnim: '',
		changeMonth: true,
		changeYear: true,
		yearRange: '1920:nn',
		// timepicker
		ampm: false,
		showSecond: false,
		timeFormat: 'hh:mm',
		// events
		onSelect: function (dateText, inst) {
			// Datepicker doesn't trigger blur, remove class by ourselves
//			inst.input.removeClass('placeholder_text');
		}
	});

//	// Charterize - setting defaults
//	$.fn.chart.set_defaults({
//		url: App.base+'api/reports/query',
//		footer: { text: 'OngageConnect\u2122' }
//	});

	// Global AJAX timeout
	$.ajaxSetup({
		timeout: 3000000
	});

	// Global AJAX error handler
	$(document).ajaxError(function (e, jqxhr, settings, exception) {
		// Handle different status codes
		if (jqxhr) {
			// Handle timeout
			if (jqxhr.statusText == 'timeout') {
				$('#notices_container').remove_all_notices().add_notice('error', 'Request has timed out, please try again. If reoccurs please contact support');
				return;
			}
			// Reload page if user has been logged-out
			if (jqxhr.status == 401) {
				window.location.reload();
				return;
			}
		}

		try {
			if ( ! jqxhr || ! jqxhr.readyState || ! jqxhr.responseText) return;
			// Try to parse errors
			alert($.parseJSON(jqxhr.responseText).join('\n'));
		} catch (error) {
			// Otherwise show responseText
			alert(jqxhr.responseText);
		}
	});

	// Dispatches JS controller
	App.dispatcher();
});
