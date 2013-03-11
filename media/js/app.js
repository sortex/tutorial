/**
 * Base admin app
 *
 * @package    Ongage
 * @author     Rafi Bodill
 * @copyright  (c) 2011 Sortex
 * @license    ****LICENSE****
 */

var App = window.App || {};

// Setting main structure
App.controllers  = {};

App.base         = App.base || '';
//App.media_base   = App.media_base || '';
App.route        = App.route || { route: '', controller: '', action: '' };
App.widgets      = {};
App.controllers  = {};
App.debug        = false;
App.date_format  = 'dd-mm-yy';
App.environments = {
	production:  '10',
	staging:     '20',
	testing:     '30',
	development: '40'
};
App.environment  = App.environment || App.environments.development;

var $notices_container = $('#notices_container');
App.notices_holder     = $notices_container.length ? $notices_container.parent() : null;
App.first_dialog_notices_holder = null;

/**
 * Calls appropriate controller/action ('route' parameter is not used YET)
 */
App.dispatcher = function () {
	if ( ! App.route || ! App.route.controller || ! App.controllers) return false;

	if (App.isset(App.controllers[App.route.controller])) {
		if (App.isset(App.controllers[App.route.controller][App.route.action])) {
			App.controllers[App.route.controller][App.route.action]();
		}
	}
};

// -------------------------------------------------------------------------------------------------------------

/**
 * JavaScript implementation of isset() function
 *
 * Usage example:
 *
 * if(isset(undefined, true) || isset('Something')) {
 *   // Do stuff
 * }
 *
 * @param  value
 * @return boolean
 */
App.isset = function(value) {
	return ! (typeof(value) == 'undefined' || value === null);
};

/**
 * Is numeric
 *
 * @param  n
 * @return boolean
 */
App.isNumber = function(n) {
   return ! isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * JS implementation of ucfirst()
 *
 * @param  str
 */
App.ucfirst = function(str) {
	str += '';
	var f = str.charAt(0).toUpperCase();
	return f + str.substr(1);
};

/**
 * Extracts key/value pairs from the query string.
 * Example: App._GET()['page']
 */
App._GET = function(params) {
	var result = {},
		queryString = params ? params.substring(1) : location.search.substring(1),
		re = /([^&=]+)=([^&]*)/g, m;

	while (m = re.exec(queryString))
	{
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	return result;
};

/**
 * Date helpers
 * Dependencies: jQueryUI datepicker
 * Format explanations, refer to http://docs.jquery.com/UI/Datepicker/formatDate
 */
App.Date = {
	/**
	 * Reformat a certain date to a new format
	 *
	 * @param source_format  The format to use in extracting the date
	 * @param target_format  The format to use in presenting the date
	 * @param value          The date value to be examined
	 */
	reformat: function (source_format, target_format, value) {
		var timestamp = $.datepicker.parseDate(source_format, value);
		return $.datepicker.formatDate(target_format, timestamp);
	}
};

/**
 * Usage: log('inside coolFunc',this,arguments);
 */
window.log = function() {
	log.history = log.history || [];
	log.history.push(arguments);
	if (this.console) {
		console.log(Array.prototype.slice.call(arguments));
	}
};

/**
 * Caret functions
 */
App.Caret = {
	/**
	 * Get caret position from a form element
	 * @param el
	 */
	get: function (el) {
		if (el.selectionStart) return el.selectionStart;

		var pos = 0;
		if (document.selection) {
			el.focus();
			var range = document.selection.createRange();
			if (range) {
				var re = el.createTextRange(),
					rc = re.duplicate();
				re.moveToBookmark(range.getBookmark());
				rc.setEndPoint('EndToStart', re);
				pos = rc.text.length;
			}
		}
		return pos;
	}
};

/**
 * Validation helpers
 *
 * @param value  Value to test
 * @param rule   Rule name
 */
App.Valid = function (value, rule) {
	var patterns = {
			numeric: /^[0-9]+$/,
			integer: /^\-?[0-9]+$/,
			decimal: /^\-?[0-9]*\.?[0-9]+$/,
			email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i,
			alpha: /^[a-z]+$/i,
			alphaNumeric: /^[a-z0-9]+$/i,
			alphaDash: /^[a-z0-9_-]+$/i,
			phone: /^[0-9-_.+*]+$/i,
			domain: /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i
		};

	return patterns[rule].test(value);
};

/**
 * Chart helpers
 */
App.Chart = {

	/**
	 * Renders a chart
	 *
	 * @param data       Chart data
	 * @param render_to  Element name to render to
	 * @param type       Chart type
	 * @param unit       Unit (ie: %, $)
	 */
	init: function (data, render_to, type, unit) {

		if ( ! unit) {
			unit = '';
		}

		// Debug mode: Wrap div with API information
		if (App.debug) {
			var $el = $('#'+render_to),
				json = $el.data('json'),
				api = App.base+data.data_url,
				$debugging = $('<div />')
					.addClass('debug')
					.prepend(' (<a href="'+api+'" target="_blank">API SOURCE '+api+'</a>)')
					.prepend('Data source: <a href="'+App.base+'chart/'+json+'" target="_blank">'+'chart/'+json+'</a>');

			if ( ! $el.parent().hasClass('debug')) {
				$el.wrap($debugging);
			}
		}

		data.chart.renderTo = render_to;
		data.credits = { text: 'Ongage-Connect', href: false };
		// i18n: http://www.highcharts.com/ref/#lang
		data.lang = { exportButtonTitle: 'Save chart as image' };

		if (type) {
			data.chart.defaultSeriesType = type;
		}

		// Check if there is any data
		var empty = ! App.isset(data.series) || ! data.series.length;
		if ( ! empty) {
			if (type == 'pie') {
				$.each(data.series[0].data, function (i, val) {
					empty = val[1] === 0 || empty;
				});
			} else {
				$.each(data.series, function (i, val) {
					empty = val.data.length === 0 || empty;
				});
			}
		}

		// Show empty message if no data
		if (empty) {
			$('#'+render_to).empty().html($('<div />').addClass('chart-empty').text('No results found for your criteria'));
			return false;
		}

		// Disabling x-axis labels if categories > 60
		if (data.xAxis.categories && data.xAxis.categories.length > 60) {
			data.xAxis.labels.staggerLines = false;
			data.xAxis.labels.step = 2;
			// Disabling x-axis labels if categories > 120
			if (data.xAxis.categories.length > 120) {
				data.xAxis.labels.enabled = false;
			}
		}

		// Disable series point labels if data > 100
		if (data.series[0] && data.series[0].data && data.series[0].data.length > 100) {
			data.plotOptions[data.chart.defaultSeriesType].dataLabels.enabled = false;
		}

		// Setup tooltip and data labels for each chart type
		switch (data.chart.defaultSeriesType) {

			case 'line':
				data.tooltip.formatter = function () {
					return '<span style="font-size:10px">'+this.x+'</span><br/>'
						+'<span style="color:#4a4a4a">'+this.series.name+'</span>: '
						+'<b>'+Highcharts.numberFormat(this.y, 0)+unit+'</b>';
				};
				data.plotOptions.line.dataLabels.formatter = function() {
					if ( ! this.y) return '';
					return Highcharts.numberFormat(this.y, 0)+unit;
				};
				break;

			case 'bar':
			case 'column':
				data.tooltip.formatter = function () {
					return '<span style="font-size:10px">'+this.x+'</span><br/>'
						+'<span style="color:#4a4a4a">'+this.series.name+'</span>: '
						+'<b>'+Highcharts.numberFormat(this.y, 0)+unit+'</b>';
				};
				data.yAxis.stackLabels.formatter = function() {
					if ( ! this.total) return '';
					return Highcharts.numberFormat(this.total, 0)+unit;
				};
				data.plotOptions.column.dataLabels.formatter = function() {
					if ( ! this.y) return '';
						return Highcharts.numberFormat(this.y, 0)+unit;
				};
				break;

			case 'pie':
				// Name: n p% of total (t)
				data.tooltip.formatter = function () {
					return this.point.name+': '+Highcharts.numberFormat(this.y, 0)+'<br/>'+this.percentage.toFixed(1)+'% of total ('+Highcharts.numberFormat(this.total, 0)+')';
				};
				// Name n (p%)
				data.plotOptions.pie.dataLabels.formatter = function() {
					return this.point.name+'<br/>'+Highcharts.numberFormat(this.y, 0)+' ('+this.percentage.toFixed(1)+'%)';
				};
				break;

			case 'funnel':
				// Change x by window width
				if ($(window).width() > 1399) {
					data.plotOptions.series.dataLabels.x = -220;
				}
				// Name: n
				data.tooltip.formatter = function () {
					return '<span style="color:#4a4a4a">'+this.point.name+'</span>: '
						+'<b>'+Highcharts.numberFormat(this.y, 0)+'</b>';
				};
				// Name (n)
				data.plotOptions.series.dataLabels.formatter = function() {
					return '<b>'+this.point.name+'</b>: '+Highcharts.numberFormat(this.point.y, 0);
				};

			default:
				// Nothing
		}
		return new Highcharts.Chart(data);
	}
};

/**
 * Modal dialog module
 */
App.Dialog = function() {

	/**
	 * Current dialog reference
	 *
	 * @var jQuery
	 */
	var dialog_object;

	// Let's return public interface object
	return {

		/**
		 * Show modal dialog
		 *
		 * @param name      String
		 * @param title     String
		 * @param body      mixed
		 * @param settings  mixed
		 */
		show : function(name, title, body, settings, callback) {
			settings = settings || {};

			// Find notices container
			var $notices_container = $('#notices_container');
			if ($notices_container.length) {
				$notices_container.remove_all_notices();
			} else {
				$notices_container = $('<div id="notices_container" />');
			}

			// Dialog options
			var options = {
				modal     : App.isset(settings.modal) ? settings.modal : true,
				draggable : true,
				resizable : false,
				title     : title,
				id        : name,
				position  : settings.position ? settings.position : 'center',
				bgiframe  : true,
				width     : 410,
				height    : 'auto',
				maxWidth  : $(window).width() * 0.8,
				maxHeight : $(window).height() * 0.8,
				open      : function (event, ui) { // Setup global open methods

					var $dialog = $(this);

					// Set black close (x) icon
					$dialog.parent().find('span.ui-icon').addClass('ui-icon-close').removeClass('ui-icon-closethick');

					if (typeof body == 'object') {
						// Move notices container into the dialog
						$dialog.prepend($notices_container);
					}

					if (settings && settings.previewMode) {

						var previewModeOptions = {
							resizable: true,
							minWidth: 200,
							minHeight: 125
						};

						// Preview Mode - Used to show previews
						var $image = $dialog.find('img');

						if ( settings.previewEmail || ! $image || $image.parent().hasClass('dialog-loading')) {
							previewModeOptions.width = 700;
							previewModeOptions.height = 700;
							$dialog.dialog('option', previewModeOptions);
							$dialog.dialog('option', 'position', 'center');
						}
						else {
							$image.bind('load', function() {
								var width = $(this).width(),
									height = $(this).height();

								// Set dialog dimensions
								previewModeOptions.width = width > options.maxWidth ? options.maxWidth : width + 20;
								previewModeOptions.height = height > options.maxHeight ? options.maxHeight : height + 128;

								// Set dialog max resizable dimensions
								previewModeOptions.maxWidth = width > options.maxWidth ? width : previewModeOptions.width;
								previewModeOptions.maxHeight = height > options.maxHeight ? height : previewModeOptions.height;

								$dialog.dialog('option', previewModeOptions);
								$dialog.dialog('option', 'position', 'center');
								$dialog.parent().css('min-width', previewModeOptions.minWidth);
								$dialog.parent().css('min-height', previewModeOptions.minHeight);
							});
							$dialog.addClass('loading');
						}
					}
					// Setup extends open methods
					if ($.isFunction(settings.open)) {
						settings.open.apply(this, [ event, ui ]);
					}
				},
				close     : function (type, data) {
					if (settings.close) {
						settings.close();
					}
					// Move notices container back into the page (or other dialog if exists)
					App.Dialog.moveNoticesBack();

					// Destroy dialog
					$(this).dialog('destroy').remove();
				},
				resizeStart : function (type, data) {
				}
			};

			// Constrain dialog dimensions
//			options.maxWidth = options.width;
			options.minWidth = options.width;

			if (settings) {
				// Extend options (settings)
				$.each(settings, function(i, j) {
					if (i !== 'open') {
						options[i] = j;
					}
				});

				if (settings.library_dialog) {
					options.resizable = true;
					options.maxWidth = $(window).width();
					options.maxHeight = $(window).height();
					options.width = options.maxWidth * 0.8;
					options.height = options.maxHeight * 0.8;
				}

				// Additional buttons
				options.buttons = {};
				if (settings.buttons) {
					var button, callback_function;
					for (var x = 0; x < settings.buttons.length; x++) {
						button = {
							text: settings.buttons[x].label
						};
						if (settings.buttons[x].id) {
							button.id = settings.buttons[x].id;
						}

						if (settings.buttons[x].callback) {
							callback_function = settings.buttons[x].callback;

							if (settings.buttons[x].id == 'submit-button') {
								button.click = function() {
									$(this).parent().find('.ui-dialog-buttonset #submit-button')
										.attr('disabled', true)
										.addClass('ui-state-disabled');
									callback_function.apply(this);
								}
							} else {
								button.click = callback_function;
							}
							
						} else {
							button.click = function() {
								$(this).dialog('close');
							}
						}
						options.buttons[x] = button;
					}
				}
			}

			// Body
			if (typeof body == 'string' || ! body) {
				var url = body;
				body = $('<div><div class="dialog-loading"><img src="'+App.media_base+'img/misc/loadingb.gif" alt="Loading..." /></div></div>');
				if (typeof url == 'string') {
					body.load(url, {}, function (event) {
						// Move notices container into the dialog
						$(this).prepend($notices_container);
						// Setup callback
						if ($.isFunction(callback)) {
							callback.apply(this, [ event ]);
						}
					});
				}
			}
			// Create dialog
			dialog_object = $(body).dialog(options);
			dialog_object.attr('id', name);
			if (settings && settings.previewMode) {
				dialog_object.find('img').bind('load', function() {
					dialog_object.removeClass('loading');
				});
			}
			// Find notices container in first open dialog
			App.first_dialog_notices_holder = $('.ui-dialog:first:visible .ui-dialog-content');
		},

		/**
		 * Close the dialog
		 */
		close : function() {
			// Destroy dialog
			dialog_object.dialog('destroy').remove();

			// Move notices container back into the page (or other dialog if exists)
			App.Dialog.moveNoticesBack();
		},

		/**
		 * Close all dialogs on screen
		 */
		closeAllDialogs : function() {
			// Remove all .ui-dialog elements from html body
			$('.ui-dialog').remove();

			// Move notices container back into the page (or other dialog if exists)
			App.Dialog.moveNoticesBack();
		},

		/**
		 * Sets width of dialog
		 */
		setWidth : function (width_px) {
			var dom_dialog = $('.ui-dialog');
			var position = dom_dialog.position();
			var new_left_offset = position.left-((width_px-dom_dialog.width()) / 2);
			dom_dialog
				.css('width', width_px+'px')
				.css('left', new_left_offset+'px');
		},

		/**
		 * Sets dialog title
		 */
		setTitle : function (title) {
			var dom_dialog = $('.ui-dialog .ui-dialog-titlebar span.ui-dialog-title')
				.html(title);
		},

		/**
		 * Checks if dialog is open
		 */
		isOpen : function () {
			return ($('.ui-dialog').length > 0);
		},

		/**
		 * Move notices container back into the page & remove all notices
		 */
		moveNoticesBack : function () {
			var $notices_container = $('#notices_container');
			if ($notices_container.length) {
				$notices_container.remove_all_notices();
			} else {
				$notices_container = $('<div id="notices_container" />');
			}

			App.first_dialog_notices_holder = $('.ui-dialog:first:visible .ui-dialog-content');
			if (App.first_dialog_notices_holder.length) {
				App.first_dialog_notices_holder.prepend($notices_container);
			} else if (App.notices_holder) {
				App.notices_holder.prepend($notices_container);
			}

		},

		/**
		 * Enable dialog button
		 */
		enableButtons: function() {
			dialog_object.parent().find('.ui-dialog-buttonset #submit-button')
				.removeAttr('disabled').removeClass('ui-state-disabled');
		}

	};

}();


/**
 * Warn user if he leaves an unsaved form page
 */
App.Warn = function () {

	// Private properties/methods
	var _has_changed = false;

	function warn() {
		if (_has_changed)
		{
			return 'Are you sure you want to leave this page?\nAny unsaved data will be lost.';
		}
	}

	function set_changed() {
		$(this).addClass('changed');
		_has_changed = true;
	}

	// Public methods
	return {

		bind: function($el, is_delegate) {
			// Use provided element, or select all forms, that do not start with 'filter' in the class name
			$el = $el || $("form:not([class^='filter'])");

			if (is_delegate) {
				$el.delegate('input, textarea',                 'keyup',  set_changed);
				$el.delegate('input[type="checkbox"], select',  'change', set_changed);
			}
			else {
				$el.find('input, textarea', 'keyup')      .bind('change', set_changed);
				$el.find('input[type="checkbox"], select').bind('change', set_changed);
			}

			// Form submit will clear warnings
			$el.submit(function () { _has_changed = false });

			// Make sure we check before leaving this window
			$(window).bind('beforeunload', warn);
		},

		unbind: function () {
			$(window).unbind('beforeunload', warn);
		},

		has_changed: function () {
			_has_changed = true;
		},

		reset: function () {
			_has_changed = false;
		},

		is_changed: function () {
			return _has_changed;
		}
	};

}();
