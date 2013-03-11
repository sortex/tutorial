/**
 * Widgets controller and plugins
 *
 * @package    Ongage\JS
 * @category   **CATEGORY**
 * @author     Rafi Bodill <rafi@sortex.co.il>
 * @copyright  Copyright (C) 2010 - 2012 Ongage, LTD. All rights reserved.
 * @license    Ongage, 2010-2012
 * @link       http://www.ongage.com
 */
App.widgets = {

	/**
	 * Init application interface
	 */
	_init: function() {


	},

	/**
	 * Setup jquery ui time spinners for hour/minute
	 * @param $hour     jquery element
	 * @param $minute   jquery element
	 * @param callback  function
	 */
	setup_spinners: function($hour, $minute, disabled, callback) {
		$hour.spinner({
			min: -1,
			max: 24,
			disabled: disabled, // disable if campaign is already scheduled
			spin: function( event, ui ) {
				var num = ui.value,
					max = 23;
				// Rewind back to 0 after max
				if ( num > max ) num = 0;
				// Rewind back to max after 0
				if ( num < 0 ) num = max;

				$(this).spinner( "value", num);

				if (typeof callback == 'function') {
					callback(false);
				}

				return false;
			}
		}).bind('keyup',function( event, ui ) {
			var num = $( this ).val(),
				max = 23;

			// Rewind back to 0 after max
			if ( num > max ) num = 0;
			// Rewind back to max after 0
			if ( num < 0 ) num = max;

			$(this).spinner( "value", num);

			if (typeof callback == 'function') {
				callback(false);
			}
			return false;
		});

		$minute.spinner({
			min: -1,
			max: 60,
			disabled: disabled, // disable if campaign is already scheduled
			spin: function( event, ui ) {
				var num = ui.value,
					max = 59;

				// Rewind back to 0 after max
				if ( num > max ) num = 0;
				// Rewind back to max after 0
				if ( num < 0 ) num = max;

				$(this).spinner( "value", num);

				if (typeof callback == 'function') {
					callback(false);
				}
				return false;
            }
		}).bind('keyup',function() {
			var num = $( this ).val(),
				max = 59;

			// Rewind back to 0 after max
			if ( num > max ) num = 0;
			// Rewind back to max after 0
			if ( num < 0 ) num = max;

			$(this).spinner( "value", num);

			if (typeof callback == 'function') {
				callback(false);
			}
			return false;
		});

	},

	/**
	 * Open esp info dialog
	 * @param $container
	 */
	esp_info_dialog: function($container) {
		$container.delegate('a.espinfo', 'click', function(){
			var $anchor = $(this);
			App.Dialog.show('espinfo', $anchor.text(), $anchor.attr('href'), {
				width: '380',
				minheight: '320',
				buttons: [ { label: 'Close' } ]
			});
			return false;
		});
	},

	/**
	 * Open Segment info dialog
	 * @param id
	 */
	segment_info_dialog: function(id) {
		App.Dialog.show('segmentinfo', 'Segment Information', App.base+'list/segments_info/'+id, {
			width: '380',
			minheight: '320',
			buttons: [ { label: 'Close' } ]
		});
	},

	/**
	 * Process ajax response
	 * - Display errors as notices
	 * - Display success message as notice
	 * - Execute success function
	 * - Execute failure function
	 * - Re-enable submit button if in dialog
	 *
	 * @param response            - Ajax response
	 * @param settings (optional) - Settings object
	 *  {
	 *    msg               -> Success message,
	 *    onSuccess         -> Success function,
	 *    onFailure         -> Failure function,
	 *    in_dialog         -> in_dialog ?,
	 *    keep_dialog_open  -> keep dialog open after success
	 *  }
	 */
	process_response: function(response, settings) {
		if (response) {
			$('#notices_container').remove_all_notices();
			if (response.success) {
				// Close dialog
				if (settings.in_dialog && ! settings.keep_dialog_open) { App.Dialog.close(); }
				// Execute success function
				if (settings.onSuccess && $.isFunction(settings.onSuccess)) { settings.onSuccess(response); }
				// Display success message (from settings or response)
				settings.msg = settings.msg ? settings.msg : response.message;
				if (settings.msg) {
					$('#notices_container').add_notice('success', settings.msg, settings.in_dialog && settings.keep_dialog_open);
				}
			} else if (response.errors) {
				// Display errors as notices
				var errors = [];
				$.each(response.errors, function (i, val) { errors.push(val); });
				$('#notices_container').add_notice('error', (errors.length > 1 ? '- ' : '' )+errors.join("<br /> - "), settings.in_dialog);
				// Re-enable submit buttons
				if (settings.in_dialog) { App.Dialog.enableButtons(); }
				// Execute failure function
				if (settings.onFailure) { settings.onFailure(); }
			}
		}
	},

	/**
	 * Display api errors as notices
	 * @param response
	 */
	display_api_error: function(response) {
		var payload = $.parseJSON(response.responseText).payload;
		if (payload.errors) {
			// Display errors from payload.errors (usually from ORM_Validation_Exception)
			$.each(payload.errors, function(column, message) {
				$('#notices_container').add_notice('error', message);
			});
		}
		else {
			// Display error from payload.message
			$('#notices_container').add_notice('error', payload.message);
		}
	},

	/**
	 * Show email preview
	 *
	 * @param email_id_or_url - Email ID or full URL to preview
	 */
	_open_email_preview: function (email_id_or_url) {
		// Use whole parameter as url or construct it to: email/preview/$id
		var url = email_id_or_url.indexOf(App.base) > -1 ? email_id_or_url : App.base+'email/preview/'+email_id_or_url;
		// Show the preview in dialog
		App.Dialog.show('email_preview', 'Email Preview', url, {
			previewMode: true,
			buttons: [{ label: 'Close' }]
		}, function () {
			// Setup iframe
			var $frame = $('#preview_frame'),
				content = $('#content_placeholder').val();

			$frame.bind('load', function () {
				$frame.contents().find('body').html(content);
				// Make sure all links in email preview will be opened in new tab/window
				$frame.contents().find('a').attr('target', '_blank');
			});
		});
	},

	/**
	 * Setting html in an iframe without source (src="")
	 *
	 * @param $iframe     - iframe element
	 * @param $textarea   - textarea element for content placeholder
	 */
	set_iframe_without_source: function($iframe, $textarea) {
		$iframe.attr('src', App.base+'blank.html');
		$iframe.bind('load', function () {
			$iframe.contents().find('body').html($textarea.val());
			// Make sure all links in email preview will be opened in new tab/window
			$iframe.contents().find('a').attr('target', '_blank');
		});
	},

	/**
	 * Get filename base name
	 *  - Removes c:/fakepath that some browsers generate
	 *
	 * @param str - filename with ext {i.e.- image.jpg}
	 */
	get_basename: function(str) {
		return str.replace("C:\\fakepath\\", "").replace(/.*\/|\.[^.]*$/g, '');
	},

	/**
	 * Setup trick for styling file inputs buttons
	 * Apply on input[type=file]
	 */
	setup_input_file: function() {
		var $input = $(this);
		if ($input.length) {
			$input.filestyle({
				image: App.media_base+'img/misc/browse.png',
				imageheight : 25,
				imagewidth : 77,
				width: 106
			});
		}
	},

	/**
	 * Check for valid dates range
	 * (start date is BEFORE end date)
	 *
	 * @param $start_date
	 * @param $end_date
	 * - return true/false
	 */
	validate_dates_range: function($start_date, $end_date) {
		var start_value = $start_date.val(),
			end_value = $end_date.val();

		// Check for valid dates
		if ( start_value && end_value && $.datepicker.parseDate(App.date_format, start_value)
			 && $.datepicker.parseDate(App.date_format, end_value) ) {

			// Parse dates
			var start_date_split = start_value.split('-'),
				end_date_split = end_value.split('-'),
				_start_date = new Date(start_date_split[2], parseInt(start_date_split[1], 10)-1, start_date_split[0]),
				_end_date = new Date(end_date_split[2], parseInt(end_date_split[1], 10)-1, end_date_split[0]);

			// Check for valid range (start date is BEFORE end date)
			return _start_date.getTime() <= _end_date.getTime();
		} else { return true; }
	},

	/**
	 * Setup start_date & end_date datepicker
	 * - Limit datepickers according to start & end dates inserted
	 *
	 * @param $start_date
	 * @param $end_date
	 * @param min_date
	 * @param max_date
	 */
	setup_start_end_datepickers: function($start_date, $end_date, min_date, max_date) {
		// remove placeholder when it affects the date value (IE bug)
		if ($start_date.val() == $start_date.attr('placeholder')) {
			$start_date.removeAttr('placeholder').val('');
		}
		if ($end_date.val() == $end_date.attr('placeholder')) {
			$end_date.removeAttr('placeholder').val('');
		}

		// Set init values
		var start_value = $start_date.val(),
			end_value = $end_date.val(),
			init_start = start_value ? start_value : null,
			init_end = end_value ? end_value : (max_date ? max_date : null),
			year_range = (min_date ? min_date.getFullYear() : '1920') + ':' + (max_date ? max_date.getFullYear() : 'nn'),
			valid_range = true;

		// Debugging
//		log('init_start', init_start);
//		log('init_end', init_end);
//		log('min-date', min_date ? min_date.toString() : null);
//		log('max-date', max_date ? max_date.toString() : null);
//		log('year-range', year_range);

		/**
		 *  Validate dates range
		 *  (start date is BEFORE end date)
		 */
		function check_range() {
			var is_valid = App.widgets.validate_dates_range($start_date, $end_date);
			if ( ! is_valid) {
				valid_range = false;
				this.value = null;
				$start_date.effect('highlight', { color: '#F55252', mode: 'show' }, 1000);
				$end_date.effect('highlight', { color: '#F55252', mode: 'show' }, 1000);
				$('#notices_container').remove_all_notices().add_notice('error', 'Start Date can\'t be after End Date.');
			}
			else { valid_range = true }
			return is_valid;
		}

		// Activate range validation after inserting dates
		$start_date.bind('blur', check_range);
		$end_date.bind('blur', check_range);

		// Activate range validation after submiting filters
		$start_date.parents('form:first').bind('submit', function() {
			if ( ! valid_range) { return false; }
			return check_range();
		})
		.find('button[type=submit]').bind('click', function() {
			return valid_range;
		});

//		// Activate range validation after clicking enter
//		$start_date.bind('keypress', function(e) {
//			if(e.which == 13 && ! check_range.apply(this)) {
//				e.preventDefault();
//				return false;
//			}
//		});
//		$end_date.bind('keypress', function(e) {
//			if(e.which == 13 && ! check_range.apply(this)) {
//				e.preventDefault();
//				return false;
//			}
//		});

		// Setup date pickers - set max/min dates according to inserted start & end dates
		$start_date.datepicker({
			minDate: min_date ? min_date : null,
			maxDate: init_end ? init_end : null,
			yearRange: year_range,
			onSelect: function(dateText) {
				$end_date.datepicker('option', 'minDate', dateText);
				return false;
			}
		}).mask('99-99-9999').validateDate();

		$end_date.datepicker({
			minDate: init_start ? init_start : null,
			maxDate: max_date ? max_date : null,
			yearRange: year_range,
			onSelect: function(dateText) {
				$start_date.datepicker('option', 'maxDate', dateText);
				return false;
			}
		}).mask('99-99-9999').validateDate();
	},

	/**
	 * Toggle checkboxes inputs that triggers form's submit every toggle [Cross-browser compatibility]
	 * Apply on requested checkbox
	 *
	 * @param $form
	 */
	toggle_checkbox_submit: function($form) {
		$(this).click(function(){
			var $checkbox = $(this).find(':checkbox');
			$checkbox.attr('checked', !$checkbox.attr('checked'));
			$form.trigger('submit');
		});
	},

	/**
	 * Convert html to text
	 *
	 * @param {String} html_contents
	 */
	convert_html_to_text: function(html_contents) {
		var	tmp = document.createElement('DIV'),
			text_contents = '';

		if (html_contents.length) {
			// Place html into a temporary DOM element
			tmp.innerHTML = html_contents;
			// Replacing anchors with a textual representation of text+href
			$(tmp).find('a').each(function () {
				var $this = $(this);
				$this.replaceWith('<br />'+$.trim($this.text())+'<br />'+$this.attr('href')+'<br />');
			});

			// Convert html to text contents
			text_contents = htmlToText(tmp.innerHTML);
			// Aggressively remove white-spaces if two or more characters
			text_contents = text_contents.replace(/[ \t\r]{2,}/g, '');
		}

		return text_contents;
	},

	/**
	 * Refreshes chart
	 *
	 * @param graph_type
	 */
	refresh_chart: function (graph_type, report_name, $filter, unit) {

		if ( ! unit) {
			unit = '';
		}

		// Create chart markup
		var $chart = $('<div />')
			.attr('id', 'chart_'+report_name)
			.addClass('chart loading')
			.data('json', report_name)
			.data('type', graph_type)
			.data('unit', unit);

		// Collect filter form values, convert to array
		var params = $filter.serializeArray();

		// Reformat each date
		$.each(params, function (i, param) {
			if (param.value && (param.name == 'date_from' || param.name == 'date_to')) {
				param.value = App.Date.reformat('dd-mm-yy', 'yy-mm-dd', param.value);
			}
		});

		if($('div.chart').length === 1)
		{
			$('div.chart').replaceWith($chart);
		}
		else
		{
			$('#chart_'+report_name).replaceWith($chart);
		}

		params.push( { name: 'graph_type', value: graph_type } );

		$.ajax({
			url: App.base+'chart/'+report_name,
			dataType: 'json',
			data: $.param(params),
			success: function (data) {
				$chart.removeClass('loading');
				// Initiate graph with data
				App.Chart.init(data, $chart.attr('id'), graph_type, $chart.data('unit'));
			}
		});
	},

	/**
	 * Validate date inputs
	 * Apply on date inputs
	 */
	validate_date: function(year_min, year_max) {
		if ( ! year_min) { year_min = 1920 }
		if ( ! year_max) {
			var current_year = new Date;
			year_max = current_year.getFullYear();
		}
		var range_error, invalid_error;
		var valid = true;
		$(this).each(function() {
			var $input = $(this);
			var value = $input.val();
			if (value)
			{
				var valid_input = true;
				var check = $.datepicker.parseDate(App.date_format, value);
				if (check) {
					// Check if date is within range (1920 - current year)
					var year = check.getFullYear();
					if ( ! (year >= year_min && year <= year_max)) {
						$input.val('');
						range_error = 'Date must be within range ('+year_min+' - '+year_max+')';
						valid_input = false;
					}
				}
				else {
					invalid_error = true;
					valid_input = false;
				}

				if ( ! valid_input) {
					$input.trigger('focus').effect('highlight', { color: '#F55252', mode: 'show' }, 1000);
					valid = false;
				}
			}
		});

		if (range_error) {
			$('#notices_container').remove_all_notices().add_notice('error', range_error);
		}

		if (invalid_error) {
			$('#notices_container').remove_all_notices().add_notice('error', 'Invalid Date');
		}
		return valid;
	},

	reset_date_range: function(range, el_from, el_to) {
		// Values can be: 5d, 1w, 1m, 3m, 2y
		var time_range = range.split('');
		// See if there are really two values (amount/date part)
		if (time_range.length > 1) {
			var from, from_date;
			from_date = new Date();
			// Subtract requested date part
			switch (time_range[1]) {
				case 'd':
					from_date.setDate(from_date.getDate() - time_range[0]);
					break;
				case 'w':
					from_date.setDate(from_date.getDate() - time_range[0] * 7);
					break;
				case 'm':
					from_date.setMonth(from_date.getMonth() - time_range[0]);
					break;
				case 'y':
					from_date.setYear(from_date.getFullYear() - time_range[0]);
					break;
				default:
					log('unknown idenitifier '+time_range[1]);
			}
			// Set 'date_from' to request time
			from = $.datepicker.formatDate('dd-mm-yy', from_date);
			el_from.val(from);

			// Set 'date_to' to today
			el_to.val($.datepicker.formatDate('dd-mm-yy', new Date()));
		}
	},

	/**
	 *  Open support dialog
	 */
	support_dialog: function() {
		App.Dialog.show('support_dialog', 'Support', App.base+'home/support', {
			width:  690,
			height: 720,
			buttons: [
				{
					id: 'submit-button',
					label: 'Send',
					callback: function () {
						var $dialog = $(this),
							params = $dialog.find('form').serializeArray();

						$.ajax({
							type: 'POST',
							url: App.base+'home/support_send',
							data: params,
							dataType: 'json',
							beforeSend: function(){
								if( ! $('#description').val()) {
									$('#description').effect("highlight", {}, 800);
									$('.ui-dialog-buttonset #submit-button')
										.removeAttr('disabled')
										.removeClass('ui-state-disabled');
									return false;
								}
							},
							success: function (response) {
								App.widgets.process_response(response, {
									in_dialog: true,
									keep_dialog_open: true,
									onSuccess: function() {
										$('#ongage_support').html('<div class="contact-message">'
											+ '<h1>Thank you for contacting<br />OngageConnect&trade; Support</h1><br />'
											+ 'Your inquiry is important to us and will be addressed as soon as possible.'
											+ '</div>');

										// Remove submit button
										$('.ui-dialog-buttonset button:nth-child(1)').remove();
										// Resize dialog
										$dialog.dialog('option', 'height', 'auto');
									}
								});
							}
						});
					}
				},
				{
					label: 'Close'
				}
			]
		}, function () {
			// Callback
			var $dialog = $(this);

			// Setup severity definitions dialog
			var $definitions_table = $dialog.find('#severity_definitions_info');
			$dialog.find('#severity_definitions').bind('click', function() {
				App.Dialog.show('severity_definitions_dialog', 'Severity Definitions', $definitions_table, {
					width:  560,
					height: 390,
					buttons: [ { label: 'Close'	} ]
				});

				return false;
			});
		});
		return false;
	},

	/**
	 *  Open FAQ dialog
	 */
	faq_dialog: function() {
		var section      = $(this).data('section'),
			window_width = $(window).width(), window_height = $(window).height();
		App.Dialog.show('onagage_faq_dialog', 'OngageConnect&trade; FAQ', App.base+'help/faq', {
			width: window_width*0.60,
			height: window_height*0.75,
			position: [window_width*0.35, window_height*0.05],
			resizable: true,
			buttons: [ { label: 'Close' } ]
		}, function () {
			// Callback
			// Apply FAQ actions
			App.widgets.faq_actions($(this).find('#ongage-faq-page'), section);
		});
		return false;
	},

	/**
	 *  Open sub-menus
	 *  @param $container - Menu container element
	 */
	setup_sub_menus: function($container) {
		$.each($container.find('.open-sub-menu'), function() {
			var $el        = $(this),
				$menu_icon = $el.find('a'),
				$sub_menu  = $el.find('.sub-menu');

			$el
				.bind('mouseenter', function() {
					// Select menu icon
					$el.addClass('selected');
					$menu_icon.addClass('selected');
					// Show sub menu
					$sub_menu.removeClass('hidden');
				})
				.bind('mouseleave', function() {
					// Un-Select menu icon
					$el.removeClass('selected');
					$menu_icon.removeClass('selected');
					// Close sub menu
					$sub_menu.addClass('hidden');
				});
		});
	},

	setup_navigation: function($container) {
		var $navigation_tabs = $container.find('.navigation-tab'),
			$initial_tab     = $navigation_tabs.filter('.initial'),
			t;

		// Show sub navigation on tab mouse-enter
		$navigation_tabs.delegate('.tab-a', 'mouseenter', function() {
			window.clearTimeout(t);
			$navigation_tabs.removeClass('selected');
			$(this).parent().addClass('selected');
		});

		// When leaving the header section - select the initial tab
		$container.bind('mouseleave', function() {
			t = setTimeout(function() {
				$navigation_tabs.removeClass('selected');
				$initial_tab.addClass('selected');
			}, 1000);
		});
	},

	/**
	 * Run FAQ page js actions
	 * - Toggle list items
	 * - Setup support link action
	 *
	 * @param $container          (#ongage-faq-page)
	 * @param section optional    Section will be opened at start
	 */
	faq_actions: function($container, section) {
		// Toggle list items
		$container.find('ol li h2').bind('click', function() {
			$(this).parent().toggleClass('opened').find('ol:first').slideToggle();
			return false;
		});

		// Open section
		if (section) {
			$container.find('h2.faq-'+section).trigger('click');
		}
	},

	/**
	 * Toggle Favorite for slickgrid tables
	 * - Apply on favorite anchor (make sure it has the right href)
	 *
	 * @param row - model row, so the model will be up to date
	 */
	toggle_favorite: function(row) {
		var $anchor = $(this);
		$.ajax({
			url: $anchor.attr('href'),
			context: this,
			cache: false,
			dataType: 'json',
			success: function(response) {
				// Update favorite button icon & tipsy
				response.favorite
					? $anchor.removeClass('state-0').addClass('state-1').attr('data-original-title', 'Unset Favorite').tooltip('setContent')
					: $anchor.removeClass('state-1').addClass('state-0').attr('data-original-title', 'Set as Favorite').tooltip('setContent');

				// Update favorite value in model row
				row.favorite = response.favorite;
			}
		});
	},

	/**
	 * Setup favorite button action
	 *
	 * @param $container - slickgrid container
	 * @param model      - data model
	 */
	setup_slickgrid_favorite: function($container, model) {
		$container.delegate('a.favorite', 'click', function() {
			var row = $(this).parents('.slick-row:first').attr('row');
			App.widgets.toggle_favorite.apply(this, [model.data[row]]);
			return false;
		});
	},

	/**
	 * Get ESP IDs from allocation
	 *
	 * @param  $allocation - Allocation container
	 * @return array
	 */
	get_esp_ids_from_allocation: function($allocation) {
		var esps = {},
			esps_array = [],
			default_esp = $('#overview').find('input[type=radio]:checked').val();

		esps[default_esp] = true;

		// Prepare ESP IDs associative object
		$allocation.find('td.inputs input.percent').each(function(i, input) {
			var $input = $(input);
			if (parseInt($input.val(), 10) > 0) {
				esps[$input.data('esp_id')] = true;
			}
		});

		// Prepare serial array for esp IDs
		for (var esp in esps) {
			esps_array.push(esp);
		}

		return esps_array;
	},

	/**
	 * Check for dynamic fields limit
	 *
	 * @param esp_ids          - ESP IDs
	 * @param email_ids        - Email IDs
	 * @param options          - optional - Options
	 * - onProceed - Proceed function - limit not exceeded or clicked "Yes" in dialog
	 * - onCancel  - Clicked "No" in dialog
	 */
	check_dynamic_fields: function(esp_ids, email_ids, options) {
		$.ajax({
			type: 'POST',
			url: App.base+'email/dynamic_fields_limit',
			data: { email_ids: email_ids ,esp_ids: esp_ids },
			dataType: 'json',
			success: function (response) {
				App.widgets.process_response(response, {
					onSuccess: function() {
						if (response.limit_reached) {
							var limit_result = response.result,
								$div2 = $('<div />'),
								$ul = $('<ul />'),
								email_names = '';

							$.each(limit_result.emails, function(i, email) {
								$div2.append($('<p />').text('Your email \''+email.name+'\' has '+email.count+' dynamic fields'));
								email_names += ((i > 0) ? ', ' : '')+' \''+email.name+'\'';
							});

							var $p1 = $('<p />').text('These ESPs do not support the number of dynamic fields you have included in your email(s) '+email_names+':'),
								$p2 = $('<p />').text('do you want to continue anyway?');

							$.each(limit_result.esps, function(i, j) {
								$ul.append($('<li />').text(j));
							});

							var $dialog_content = $('<div />').append($p1).append($ul).append($div2).append($p2);

							// Open dynamic fields limit dialog
							App.Dialog.show('dynamic_fields_limit', 'Dynamic Fields Limit Warning', $dialog_content, {
								width: '450',
								height: '290',
								buttons: [
									{
										id: 'submitbutton',
										label: 'Yes',
										callback: function () {
											App.Dialog.close();
											if (options.onProceed) { options.onProceed(); }
										}
									},
									{
										label: 'No',
										callback: function() {
											App.Dialog.close();
											if (options.onCancel) { options.onCancel(); }
										}
									}
								]
							});
						}
						else {
							if (options.onProceed) { options.onProceed(); }
						}
					}
				});
			}
		});
	},

	/**
	 * Change ongage date formats to mask() plugin pattern
	 * i.e dd/mm/yyyy -> 99/99/9999
	 *
	 * @param date_format
	 * @return string
	 */
	date_to_mask_pattern: function(date_format) {
		return date_format
			.replace('dd', '99')
			.replace('mm', '99')
			.replace('yyyy', '9999')
			.replace('hh24', '99')
			.replace('mi', '99')
			.replace('ss', '99');
	},

	/**
	 * Change ongage date formats to datepicker() plugin pattern
	 * i.e dd/mm/yyyy -> dd/mm/yy, mm/dd/yyyy hh24:mi:ss -> mm/dd/yy 00:00:00
	 *
	 * @param date_format
	 * @return string
	 */
	date_to_datepicker_pattern: function(date_format) {
		return date_format
			.replace('yyyy', 'yy')
			.substr(0, 8);
	},

	/**
	 * Setup on change in 'select2' multi-select plugin
	 *
	 * @param e
	 */
	onChange_select2: function(e) {
		var $select = $(this),
			values  = e.val,
			data    = [];

		if (e.added) {
			if (parseInt(e.added.id, 10)) {
				if (values.indexOf('0') >= 0) {
					// Remove "All" option
					values.splice(values.indexOf('0'), 1);
				}
			}
			else {
				// Leave only the "All" option
				values = ['0'];
			}
		}

		if ($select.hasClass('select-mailings')) {
			$.each(values, function(i, j) {
				$.each(mailings, function(index, mailing) {
					if (mailing.id == j) {
						data.push({id: mailing.id, text: mailing.name});
					}
				});
			});
		}
		else if ($select.hasClass('select-esps')) {
			$.each(values, function(i, j) {
				$.each(esps, function(index, esp) {
					if (esp.id == j) {
						data.push({id: esp.id, text: esp.name});
					}
				});
			});
		}

		// Set prepared data
		$select.select2('data', data);
	},

	/**
	 * Check if contacts count is finished every x seconds
	 *
	 * @param id
	 * @param callback optional
	 */
	asynchronous_count: function(id, callback) {
		if ( ! id) { return false; }

		// Starting 5 seconds interval and try get the count for the given token
		var t = setInterval(function() {
			$.ajax({
				type: 'GET',
				url: App.base+'api/contact_counts/'+id,
				dataType: 'json',
				success: function (response) {
					// Check if count finished (0 can also be a valid count)
					if ($.isNumeric(response.metadata.total)) {
						clearInterval(t);

						// Execute callback
						if (callback) { callback(); }

						// Show "Contacts Count" dialog
						var $p = $('<p />').text('Total Contacts: '+response.metadata.total);
						App.Dialog.show('count', 'Contacts Count', $('<div />').append($p), {
							width: '380',
							height: '160',
							buttons: [ { label: 'Close' } ]
						});
					}
				},
				error: function(response) {
					clearInterval(t);
					App.widgets.display_api_error(response);
					return false;
				}
			});
		}, 5000);
	},

	/**
	 * Check for "In Progress" ESPs
	 * - If Found: open a dialog with all ESPs options and link them to their ESP Setup page
	 */
	checkInProgressESPs: function() {

		var in_wizard = $(this).hasClass('in-wizard');

		// Check for "In Progress" ESPs
		$.ajax({
			url: App.base+'settings/get_in_progress_esps',
			success: function (response) {
				App.widgets.process_response(response, {
					onSuccess: function() {
						if (response.esps.length) {

							// Only 1 ESP "In Progress" - redirect to setup that ESP
							if (response.esps.length == 1) {
								location.href = App.base+'settings/esp/'+response.esps[0].id+(in_wizard ? '?wizard=true' : '');
								return false;
							}

							// Get "Choose ESP to setup" dialog HTML
							$.ajax({
								type: 'POST',
								data: { esps: response.esps },
								url: App.base+'settings/esp_choose'+(in_wizard ? '?wizard=true' : ''),
								dataType: 'html',
								success: function (dialog_html) {
									// Show "Choose ESP to setup" dialog
									App.Dialog.show('choose-esps-dialog', 'Choose ESP to setup', $(dialog_html), {
										buttons: [ { label: 'Close' } ]
									});
								}
							});
						}
						else {
							// No "In Progress" ESPs found - redirect user to Find ESP page
							location.href = App.base+'networking/connections'+(in_wizard ? '?wizard=true' : '');
							return false;
						}
					}
				})
			}
		});
		return false;
	},

	// Setup RSS newsticker (using cycle plugin)
	setup_rss_news: function() {
		$(function() {
			var $news_ticker = $('#news-items');

			// Setup RSS news ticker
			$news_ticker.cycle({
				fx:'scrollUp',
				delay: 3000,
				timeout: 6000,
				speed: 1500,
				pause: 1,
				random: 0,
				fastOnEvent: 1
			});

			// Remove last <hr /> on every group
			$news_ticker.find('.cycleDiv').removeClass('hidden');

			// Allow user to click on text or right arrow
			$news_ticker.delegate('.text', 'click', function() {
				window.open($(this).parent().find('a').attr('href'));
			});

			// Toggle Play/Stop button
			var $toggle_anchor = $('#toggle-news');
			$toggle_anchor.bind('click', function() {
				if ($toggle_anchor.hasClass('event_status_1')) {
					// Pressed Stop
					$toggle_anchor.removeClass('event_status_1');
					$toggle_anchor.addClass('event_status_0');
					$news_ticker.cycle('pause');
				}
				else {
					// Pressed Play
					$toggle_anchor.removeClass('event_status_0');
					$toggle_anchor.addClass('event_status_1');
					$news_ticker.cycle('resume');
				}
				return false;
			});
		});
	}
};

/**
 * Datepicker validation plugin
 */
(function($) {
	$.fn.validateDate = function() {
		return this.each(function () {
			$(this).bind('change', function() {
				// Validate date
				var $this = $(this);
				if ($this.val())
				{
					var dt = $.datepicker.parseDate(App.date_format, $this.val());
					if ( ! dt) {
						// Not valid date -> set to max day & month values (only if date value inserted)
						$this.val($this.val() ? '31/12/'+$this.val().substr(6, 4) : '')
							.effect('highlight', { color: '#F55252', mode: 'show' }, 1000);
					}
				}
			});
		})
	}
})(jQuery);


/**
 * Tablerize Plugin
 */
(function($) {
	$.fn.tablerize = function(options, url) {
		var settings = $.extend({}, $.fn.tablerize.defaultOptions, options);

		return this.each(function() {
			var $this = $(this),
				json = $this.data('json'),
				filter = $this.data('filter'),
				group = $this.data('group') || 'default',
				template = $this.data('template') || '',
				model_id = $this.data('id');

			$this.addClass('loading').css('height', '300px');

			var source_url = url ? url : App.base+'tabler/'+json+'?group='+group+'&template='+template+'&id='+model_id;

			$.ajax({
				cache: false,
				url: source_url,
				success: function (data) {
					$this.removeClass('loading').css('height', '');
					$this.html(data).find('table:first').tabler({
						filter:      filter,
						on_refresh:  settings.on_refresh
					});
				},
				error: function (event) {
					if ( ! event || ! event.readyState || ! event.responseText) return;
					var $error = $('<div />').html(event.responseText);

					if ($('#error_dialog').length) {
						$('#error_dialog').append($error);
					} else {
						App.Dialog.show('error_dialog', 'Something went wrong', $error, {
							width: App.environment == App.environments.production ? '320' : '760',
							height: App.environment == App.environments.production ? '180' : '560',
							buttons: [ { label: 'Close' } ]
						});
					}
				}
			});

		});
	};

	// Default settings
	$.fn.tablerize.defaultOptions = {
		on_refresh:  function () {
			// Re-setup tooltip
			$('table.ajax > tbody > tr').tooltip({
				title: function () {
					// function to deliver tooltip text
					var txt = $(this).next('.window').find('td').html();
					return txt ? txt : '';
				}
			});
		}
	};
})(jQuery);

/**
 * jQuery.ajaxQueue - A queue for ajax requests
 *
 * (c) 2011 Corey Frang
 * Dual licensed under the MIT and GPL licenses.
 */
var ajax_queue = $({});

$.ajaxQueue = function (options) {
	var jqXHR,
		dfd = $.Deferred(),
		promise = dfd.promise();

	// Queue our ajax request
	ajax_queue.queue(doRequest);

	// Add the abort method
	promise.abort = function (statusText) {

		// Proxy abort to the jqXHR if it is active
		if (jqXHR) {
			return jqXHR.abort(statusText);
		}

		// If there wasn't already a jqXHR we need to remove from queue
		var queue = ajax_queue.queue(),
			index = $.inArray(doRequest, queue);

		if (index > -1) {
			queue.splice(index, 1);
		}

		// And then reject the deferred
		dfd.rejectWith(options.context || options, [ promise, statusText, "" ]);
		return promise;
	};

	// Run the actual query
	function doRequest(next) {
		jqXHR = $.ajax(options)
			.then(next, next)
			.done(dfd.resolve)
			.fail(dfd.reject);
	}

	return promise;
};
