/**
 * Datagrid module
 *
 * @package    Sortex/Datagrid
 * @category   **CATEGORY**
 * @author     Rafi Bodill <rafi@sortex.co.il>
 * @copyright  **COPYRIGHT**
 * @license    **LICENSE**
 * @link       **LINK**
 */
(function ($) {

	// Default datagrid plugin configuration
	var default_settings = {
		url: '',
		caption: '',
		model: null,
		defaultMinWidth: null,
		buttons: [],
		buttonsFormatter: false,
		footer: true,
		controls: true,
		enableRefresh: false,
		enableColumnPicker: true,
		enableTotals: false,
		pageSize: 15,
		exportFileName: '',

		// Slickgrid options:
		rowHeight: 31,
		defaultColumnWidth: 80,
		enableTextSelectionOnCells: true,
		enableCellNavigation: false,
		autoHeight: false,
		forceFitColumns: true,
		editable: false,
		enableAddRow: false,
		disableScrollbar: true
	};

	// ------------------------------------------------------- METHODS ---------------------------------------------------------

	var methods = {

		/**
		 * Init widget
		 *
		 * @param {Object} options User configuration
		 */
		init: function (options) {
			return this.each(function () {
				var $this    = $(this),
					data     = $this.data('datagrid');

				// Merge default settings
				options = $.extend({}, default_settings, options);

				if (options.disableScrollbar) {
					options.leaveSpaceForNewRows = true;
				}

				// Set automatic default settings for Slickgrid columns
				// Setting field as id if field is not present, and default minWidth
				$.each(options.columns, function (i, column) {
					if (column.field === undefined) {
						column.field = column.id;
					}
					if (options.defaultMinWidth && ! column.minWidth) {
						column.minWidth = options.defaultMinWidth;
					}
					if (column.sortable === undefined) {
						column.sortable = true;
					}
					if (column.toolTip) {
						// Add Sortex tooltip class
						column.headerCssClass = 'info2';
					}
				});

				$this.addClass('datagrid');

				// If the plugin hasn't been initialized yet
				if ( ! data) {

					// Store target and settings within element data collection
					$this.data('datagrid', {
						target:   $this,
						settings: options,
						grid:     null,
						pager:    null,
						model:    null,
						picker:   null,
						indicate: false
					});

					methods.setup.apply(this, [ options ]);
				} else {
					data.settings = options;
				}

				methods.bind.call(this);
			});
		},

		/**
		 * Setup extra elements and bindings
		 *
		 * @param {Object} settings
		 */
		setup: function (settings) {
			var $this     = $(this),
				data      = $this.data('datagrid'),
				$caption,
				$controls;

			// Build caption div
			if (settings.caption) {
				$caption = $('<div />').addClass('grid-header')
					.append($('<label />').text(settings.caption));
				$this.before($caption);
			}

			if (settings.footer) {
				data.status = $('<span class="slick-pager-status" />');
				$this.after($('<div class="slick-pager" />').append(data.status));
			}

			$(window).resize(function () {
				data.grid.resizeCanvas();
			});

			if (settings.controls) {
				$controls = $('<div />').addClass('grid-controls')
					.append('<label class="items-per-page">Items Per Page <select class="page_size"></select></label>');

				var title    = settings.exportFileName || $('h1:first').text(),
					columns  = [],
					endpoint = settings.model.getUrl(),
					$slct    = $controls.find('select'),
					pageSize = settings.pageSize;

				$.each([ pageSize, Math.ceil(pageSize*1.66), Math.ceil(pageSize*3.33), Math.ceil(pageSize*6.66), pageSize*10 ], function (i, val) {
					$slct.append('<option>'+val+'</option>');
				});

				// Add groupped-by field
				if (settings.model.getGroupGetter && settings.model.getGroupGetter()) {
					columns.push({ fld: settings.model.getGroupGetter(), name: App.ucfirst(settings.model.getGroupGetter().replace(/_/g, ' ')), type: '' });
				}

				// Collect columns from settings
				$.each(settings.columns, function(i, column) {
					// Skip custom columns (like buttons)
					if (column.id.charAt(0) !== '_') {
						columns.push({ fld: column.field, name: column.name, type: column.type || '' });
					}
				});
				// Add list of columns
				endpoint += endpoint.match(/\?/) ? '&' : '?';
				endpoint += 'format=csv&limit=4000';
				endpoint += '&columns='+encodeURIComponent(JSON.stringify(columns));
				if (title) {
					endpoint += '&title='+encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9_\-\(\)]/g, '_'));
				}

				var buttons_template = '<div class="btn-group">'
					+ '<span><a href="#" class="info icon excel" title="Export to CSV">Export</a></span>';

				// Limit column-picker icon only if more than 2 columns
				if (columns.length > 2) {
					buttons_template += '<span><a href="#" class="info icon gear" title="Customized Columns">Columns</a></span>';
				}
				buttons_template += '</div>';

				$controls.append(buttons_template);
				$controls.find('a.excel').attr('href', endpoint);
				if (settings.enableRefresh) {
					$controls.append('<button type="button" class="btn-grey refresh right">Refresh</button>');
				}
				$this.before($controls);

				$controls.find('select.page_size').bind('change.datagrid', function () {
					var headerHeight = data.settings.rowHeight - 7; // TODO header height should be dynamic
					data.settings.pageSize = parseInt($(this).val(), 10);
					$this.height(data.settings.pageSize * data.settings.rowHeight + headerHeight);
					data.grid.resizeCanvas();
					// Scroll to top, for page 1
					$(data.grid.getCanvasNode()).parent().scrollTop(0);
					// Ensure data for whole page, only for RemoteModel
					if (settings.model.ensureData) {
						settings.model.ensureData(0, data.settings.pageSize);
					}
					// Updating pagination
					if (data.pager) {
						data.pager.empty();
						methods.setup_pagination(data, data.settings.pageSize, data.pager.data('total_items'));
					}
				});

				if (settings.enableRefresh) {
					$controls.find('button.refresh').bind('click.datagrid', function () {
						if (settings.model.requery) {
							data.grid.setSortColumn();
							settings.model.requery();
						} else {
							settings.model.clear();
							settings.model.ensureData();
						}
					});
				}

				$controls.find('a.excel').bind('click.datagrid', function () {
					var url = $(this).attr('href'),
						win_name = ($('h1:first').text() || '').replace(/\W{1,}/g, '_')+'_CSV',
						query;

					if (settings.model.getRequestQuery()) {
						query = settings.model.getRequestQuery();
						try {
							if (typeof query == 'string') {
								query = $.parseJSON(query);
							}
						} catch (ex) {
							// not a JSON
							return false;
						}
						url += '&'+decodeURIComponent($.param(query));
					}
					window.open(url, win_name);
					return false;
				});

				$controls.find('a.gear').bind('click.datagrid', function (e) {
					data.grid.onHeaderContextMenu.notify({ target: e.target }, e);
					return false;
				});
			}

			if (settings.model.isRemote) {

				settings.model.onDataLoading.subscribe(function () {
//					log('RemoteModel.onDataLoading');
					if ( ! data.indicate) {
					data.indicate = $("<span class='loading-indicator'><label>Loading...</label></span>").appendTo(document.body);

					data.indicate
						.css("position", "absolute")
						.css("top", $this.position().top + $this.height() / 2 - data.indicate.height() / 2)
						.css("left", $this.position().left + $this.width() / 2 - data.indicate.width() / 2);
					}

					data.indicate.show();
				});

				settings.model.onDataLoaded.subscribe(function (e, args) {
//					log('RemoteModel.onDataLoaded');
					var dataLength = data.grid.getDataLength();
					for (var i = args.from; i <= args.to; i ++) {
						data.grid.invalidateRow(i);
					}
					data.grid.updateRowCount();
					data.grid.render();

					if ( ! data.pager || data.pager.data('total_items') != dataLength) {
//						log('** Total items changed!');
						// Scroll to top, for page 1
						$(data.grid.getCanvasNode()).parent().scrollTop(0);
						// Re-setup pagination
						methods.setup_pagination(data, data.pager ? data.pager.data('page_size') : data.settings.pageSize, dataLength);
					}

					data.indicate && data.indicate.fadeOut();
				});

			} else {
				// Build pager div
//				data.pager = $('<div />').attr('id', this.id+'-pager');
//				$this.after(data.pager);

				if (settings.enableTotals) {
					settings.showHeaderRow = true;
				}

				if ( ! settings.model) {
					settings.model = new Slick.Data.DataView();
				}

				settings.model.onPagingInfoChanged.subscribe(function (e, args) {
//					log('DataView.onPagingInfoChanged');
				});

				settings.model.onRowCountChanged.subscribe(function (e, args) {
//					log('DataView.onRowCountChanged: datagrid', settings);
					data.grid.updateRowCount();
					data.grid.render();
				});

				settings.model.onRowsChanged.subscribe(function (e, args) {
//					log('DataView.onRowsChanged: datagrid', settings);
					data.grid.invalidateRows(args.rows);
					data.grid.render();

					var dataLength = data.grid.getDataLength();

					if ( ! data.pager || data.pager.data('total_items') != dataLength) {
//						log('** Total items changed!');
						// Scroll to top, for page 1
						$(data.grid.getCanvasNode()).parent().scrollTop(0);
						// Re-setup pagination
						methods.setup_pagination(data, data.pager ? data.pager.data('page_size') : data.settings.pageSize, dataLength);
					}
				});

				settings.model.onDataChanged.subscribe(function (e, args) {
//					log('DataView.onDataChanged: datagrid');
					data.grid.invalidateAllRows();
					data.grid.render();
					if (settings.enableTotals) {
						methods.update_totals(data);
					}
				});

				settings.model.onEmptyResult.subscribe(function (e, args) {
//					log('DataView.onEmptyResult: datagrid');
					methods.setup_pagination(data, data.pager ? data.pager.data('page_size') : data.settings.pageSize, 0);
				});
			}
		},

		/**
		 * Setup the pagination footer
		 *
		 * @param data         {Object}
		 * @param page_size    {Integer}
		 * @param dataLength   {Integer}
		 */
		setup_pagination: function (data, page_size, dataLength) {
			var vp     = data.grid.getViewport(),
				status = dataLength > 0
					? "Showing "+(vp.top+1)+"-"+(vp.bottom > dataLength ? dataLength : vp.bottom)+" of " + dataLength + " rows"
					: 'No records';

			data.status && data.status.text(status);

			page_size = parseInt(page_size, 10);
			if ( ! data.pager) {
				data.pager = $('<div />').addClass('pagination-container');
				data.status && data.status.after(data.pager);
			}
			data.pager.data('page_size', page_size);
			data.pager.data('total_items', dataLength);
			data.pager.pagination(dataLength, {
				current_page:   Math.floor(data.grid.getViewport().top / page_size),
				items_per_page: page_size,
				callback:       function(page, pagination) {
					var $vp       = $(data.grid.getCanvasNode()).parent(),
						scrollTop = page * page_size * data.settings.rowHeight;

					$vp.scrollTop(scrollTop);
					return false;
				},
				prev_text: '<span></span>',
				next_text: '<span></span>',
				prev_show_always: true,
				next_show_always: true
			});
		},

		update_pagination: function (data, viewport) {
			// Retrieve page_size from pager data attribute, when it is changed dynamically,
			// or from original settings.
			var page_size = data.grid.pager ? parseInt(data.pager.data('page_size'), 10) : data.settings.pageSize,
				canvas    = data.grid.getCanvasNode(),
				scrollTop = $(canvas).parent().scrollTop(),
				newPage   = Math.ceil(scrollTop / data.settings.rowHeight / page_size),
				vp = viewport || data.grid.getViewport(),
				dataLength = data.grid.getDataLength(),
				status = dataLength > 0
					? "Showing "+(vp.top+1)+"-"+(vp.bottom > dataLength ? dataLength : vp.bottom)+" of " + dataLength + " rows"
					: '';

			data.status && data.status.text(status);

			if (data.pager && data.pager.data('current_page') != newPage) {
				// trigger pagination plugin, skip callback
				data.pager.trigger('setPage', [ newPage, true ]);
			}
		},

		update_totals: function (data) {
			var items = data.settings.model.getItems(),
				sum;

			for (var i = 0; i < data.settings.columns.length; i++) {
				if (data.settings.columns[i].id !== 'selector') {
					var header = data.grid.getHeaderRowColumn(data.settings.columns[i].id);
					if (header && i) {
						sum = 0;
						for (var j = 0; j < items.length; j++) {
							sum += parseInt(items[j][data.settings.columns[i].id] || 0);
						}
						sum = Highcharts.numberFormat(sum, 0);
						$(header).html(sum);
					} else if (header) {
						$(header).html('Total')
					}
				}
			}
		},

		/**
		 * Bind widget
		 */
		bind: function () {
			var $this     = $(this),
				data      = $this.data('datagrid'),
				settings  = data.settings;

			var model = settings.model;

			var sortCol;
			var sortdir;

			if (settings.buttons.length) {
				var buttonsPlugin = new Slick.ButtonsColumn({
					buttons: settings.buttons,
					buttonsFormatter: settings.buttonsFormatter
				});

				settings.columns.push(buttonsPlugin.getColumnDefinition());
			}

			if (model.isRemote) {
				data.grid = new Slick.Grid('#'+this.id, model.data, settings.columns, settings);

				data.grid.onViewportChanged.subscribe(function (e, args) {
					var vp = data.grid.getViewport();
					model.ensureData(vp.top, vp.bottom);

					methods.update_pagination(data, vp);
				});

				data.grid.onSort.subscribe(function (e, args) {
					model.setSort(args.sortCol.field, args.sortAsc ? 1 : - 1);
					var vp = data.grid.getViewport();
					model.ensureData(vp.top, vp.bottom);
				});

				data.grid.onViewportChanged.notify();

			} else {
//				dataView.setPagingOptions({ pageSize: 10 });

				data.grid = new Slick.Grid('#'+this.id, model, settings.columns, settings);
//				pager = new Slick.Controls.Pager(model, data.grid, data.pager);

				data.grid.onViewportChanged.subscribe(function (e, args) {
					methods.update_pagination(data);
				});

				if (settings.enableTotals) {
					data.grid.onColumnsReordered.subscribe(function (e, args) {
						methods.update_totals(data);
					});
				}

				function comparer(a, b) {
					var x = a[sortCol.field], y = b[sortCol.field];
//					log('comparer', sortCol, sortCol.type);
					if ( ! sortCol.type || sortCol.type == 'int') {
						x = parseInt(x);
						y = parseInt(y);
					}
//					log(x, y, (x == y ? 0 : (x > y ? 1 : - 1)));
					return (x == y ? 0 : (x > y ? 1 : - 1));
				}

				data.grid.onSort.subscribe(function (e, args) {
					switch (args.sortCol.type) {
						case 'date':
							break;

						default:
					}
					sortdir = args.sortAsc ? 1 : - 1;
					sortCol = args.sortCol;

					// Cache the sorted column, for example group comparers can use this information
					model.setSortInfo(sortCol, sortdir);

					if ($.browser.msie && $.browser.version <= 8) {
						// more limited and does lexicographic sort only by default, but can be much faster
						// use numeric sort of % and lexicographic for everything else
						model.fastSort(sortCol.field, args.sortAsc);
					} else {
						// using native sort with comparer
						// preferred method but can be very slow in IE with huge datasets
						model.sort(comparer, args.sortAsc);
					}
				});
			}

			if (settings.enableColumnPicker) {
				data.picker = new Slick.Controls.ColumnPicker(settings.columns, data.grid, settings, $this.attr('id'));
			}

			if (settings.buttons.length) {
				data.grid.registerPlugin(buttonsPlugin);
			}

			// Set AutoToolTips plugin to show slickgrid tooltips when cell text is cut
			data.grid.registerPlugin(new Slick.AutoTooltips());
		},

		/**
		 * Destroy datagrid widget
		 */
		destroy: function () {
			return this.each(function () {

				var $this = $(this),
					data = $this.data('datagrid');

				// Un-binding events by namespace
				$(window).unbind('.datagrid');

				if (data) {

					// Removing controls
					data.pager && data.pager.remove();
					data.pager = null;

					if (data.settings.controls) {
						$this.prev('.grid-controls').remove();
					}

					if (data.settings.footer) {
						$this.next('.slick-pager').remove();
					}

					// Destroying datagrid
					data.grid && data.grid.destroy();
					data.grid = null;

					// Emptying target element
					$this.empty();
					$this.removeClass('datagrid');

					// Emptying data collections
					data.response = null;
					data.target = null;
				}

				// Removing data collections
				$this.removeData('datagrid');
			});
		},

		/**
		 * Flag filtered columns
		 * - Finding filtered columns of $form
		 * - Adding 'slick-header-column-filtered' class to datagrid columns
		 *
		 * @param settings
		 * - filter_form          - filter form
		 * - filters_columns_map  - filter to column map names (e.g. schedule_date_from (input) -> schedule_date (column))
		 */
		flag_filtered_columns: function (settings) {
			if ( ! settings.filter_form || ! settings.filters_columns_map) { return false; }

			var $filter_elements = settings.filter_form.find('input:text, input:checked, select').filter(function() {
					// Get only inputs with real value (not placeholder value)
					return this.value && this.value != $(this).attr('placeholder')
				}),
				$grid_columns = $(this).find('.slick-header-column'),
				filtered_columns = {},
				_filtered_column;

			// Prepare filtered columns names array
			if ($filter_elements) {
				$.each($filter_elements, function() {
					_filtered_column = settings.filters_columns_map[$(this).attr('name')];
					if (_filtered_column) {
						if ($.isArray(_filtered_column)) {
							// Sometimes input filters more then 1 columns (e.g. name -> name, description) - flag all used columns
							$.each(_filtered_column, function(i, single_column) {
								filtered_columns[single_column] = true;
							});
						}
						else {
							filtered_columns[_filtered_column] = true;
						}
					}
				});
			}

			// Clear filtered class for all columns
			$grid_columns.removeClass('slick-header-column-filtered');

			// add filtered class for filtered columns
			if (filtered_columns) {
				$grid_columns
					.filter(function() {
						return filtered_columns[$(this).data('fieldId')];
					})
					.addClass('slick-header-column-filtered');
			}
		},

		/**
		 * Refresh data
		 *
		 * @param {Object} settings  Override element's stored settings
		 */
		refresh: function (settings) {
			var $this     = $(this),
				data      = $this.data('chart');

		}

	};

	/**
	 * Datagrid plugin
	 *
	 * @param method
	 */
	$.fn.datagrid = function (method) {

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			if (typeof method === 'object' || ! method) {
				return methods.init.apply(this, arguments);
			} else {
				$.error('Method '+method+' does not exist on jQuery.datagrid');
			}
		}
	};

})(jQuery);
