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
	
	// Automatically calls all functions in FORMALIZE.init
	FORMALIZE.go();

	// Add text inputs "reset" button
	$('form.filter, form.reset-texts').each(HELPER.add_text_reset_button);

	// Setup trick for styling file inputs buttons with class "browse"
	App.widgets.setup_input_file.apply($(".fileinput input[type=file].browse"));

	var $body = $('body');

	// Setup navigation
	App.widgets.setup_navigation($('#navigation'));

	// Setup sub menus
	App.widgets.setup_sub_menus($('#topnav'));

	$body
		// Ongage support dialog
		.on('click', '.ongage-support', App.widgets.support_dialog)
		// Ongage FAQ dialog
		.on('click', '.ongage-faq', App.widgets.faq_dialog)
		// ESP Setup link - check for "In Progress" ESPs
		.on('click', '.esp-setup', App.widgets.checkInProgressESPs)
		// Initialize tooltips
		.tooltip({ selector: '.info,.ui-datepicker-trigger' });

	$('html')
		// Setup tooltips with breaking text lines ("white-space: normal;")
		.tooltip({
			selector: '.info2',
			template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner normal-white-space"></div></div>',
			html: true
		});

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

	// Charterize - setting defaults
	$.fn.chart.set_defaults({
		url: App.base+'api/reports/query',
		footer: { text: 'OngageConnect\u2122' }
	});

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

	// Bind list-change select onchange event - submit form when the list changes
	$body.find('#list_picker').bind('change', function() {
		this.form.submit();
	});

	// Dispatches JS controller
	App.dispatcher();



});
