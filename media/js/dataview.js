(function ($) {

	$.extend(true, window, {
		Slick: {
			Data: {
				DataView: DataView,
				Aggregators: {
					Avg: AvgAggregator,
					Min: MinAggregator,
					Max: MaxAggregator,
					Sum: SumAggregator
				}
			}
		}
	});

	/***
	 * A sample Model implementation.
	 * Provides a filtered view of the underlying data.
	 *
	 * Relies on the data item having an "id" property uniquely identifying it.
	 */
	function DataView(options) {
		var self = this;

		var defaults = {
			groupItemMetadataProvider: null,
			inlineFilters: false
		};

		// private
		var idProperty = "id";  // property holding a unique row id
		var items = [];         // data by index
		var rows = [];          // data by row
		var idxById = {};       // indexes by id
		var rowsById = null;    // rows by id; lazy-calculated
		var filter = null;      // filter function
		var updated = null;     // updated item ids
		var suspend = false;    // suspends the recalculation
		var sortAsc = true;
		var fastSortField;
		var sortComparer;
		var refreshHints = {};
		var prevRefreshHints = {};
		var filterArgs;
		var filteredItems = [];
		var compiledFilter;
		var compiledFilterWithCaching;
		var filterCache = [];
		var sortInfo = {};

		// query and form bind
		var $formFilter;
		var requestQuery;
		var parsedQuery;
		var url;
		var request_type;

		// grouping
		var groupingGetter;
		var groupingGetterIsAFn;
		var groupingFormatter;
		var groupingComparer;
		var groups = [];
		var collapsedGroups = {};
		var aggregators;
		var aggregateCollapsed = false;
		var compiledAccumulators;

		var pagesize = 0;
		var pagenum = 0;
		var totalRows = 0;

		// events
		var onRowCountChanged = new Slick.Event();
		var onRowsChanged = new Slick.Event();
		var onPagingInfoChanged = new Slick.Event();
		// sortex events
		var onDataChanged = new Slick.Event();
		var onEmptyResult = new Slick.Event();

		options = $.extend(true, {}, defaults, options);

		function beginUpdate() {
			suspend = true;
		}

		function endUpdate() {
			suspend = false;
			refresh();
		}

		function setRefreshHints(hints) {
			refreshHints = hints;
		}

		function setFilterArgs(args) {
			filterArgs = args;
		}

		function updateIdxById(startingIndex) {
			startingIndex = startingIndex || 0;
			var id;
			for (var i = startingIndex, l = items.length; i < l; i ++) {
				id = items[i][idProperty];
				if (id === undefined) {
					throw "Each data element must implement a unique 'id' property";
				}
				idxById[id] = i;
			}
		}

		function ensureIdUniqueness() {
			var id;
			for (var i = 0, l = items.length; i < l; i ++) {
				id = items[i][idProperty];
				if (id === undefined || idxById[id] !== i) {
					throw "Each data element must implement a unique 'id' property";
				}
			}
		}

		function getItems() {
			return items;
		}

		function setItems(data, objectIdProperty) {
			if (objectIdProperty !== undefined) {
				idProperty = objectIdProperty;
			}
			items = filteredItems = data;
			idxById = {};
			updateIdxById();
			ensureIdUniqueness();
			refresh();
		}

		function setPagingOptions(args) {
			if (args.pageSize != undefined) {
				pagesize = args.pageSize;
				pagenum = Math.min(pagenum, Math.ceil(totalRows / pagesize));
			}

			if (args.pageNum != undefined) {
				pagenum = Math.min(args.pageNum, Math.ceil(totalRows / pagesize));
			}

			onPagingInfoChanged.notify(getPagingInfo(), null, self);

			refresh();
		}

		function getPagingInfo() {
			return {pageSize: pagesize, pageNum: pagenum, totalRows: totalRows};
		}

		function sort(comparer, ascending) {
			sortAsc = ascending;
			sortComparer = comparer;
			fastSortField = null;
			if (ascending === false) {
				items.reverse();
			}
			items.sort(comparer);
			if (ascending === false) {
				items.reverse();
			}
			idxById = {};
			updateIdxById();
			refresh(true);
		}

		/***
		 * Provides a workaround for the extremely slow sorting in IE.
		 * Does a [lexicographic] sort on a give column by temporarily overriding Object.prototype.toString
		 * to return the value of that field and then doing a native Array.sort().
		 */
		function fastSort(field, ascending) {
			sortAsc = ascending;
			fastSortField = field;
			sortComparer = null;
			var oldToString = Object.prototype.toString;
			Object.prototype.toString = (typeof field == "function") ? field : function () {
				return this[field]
			};
			// an extra reversal for descending sort keeps the sort stable
			// (assuming a stable native sort implementation, which isn't true in some cases)
			if (ascending === false) {
				items.reverse();
			}
			items.sort();
			Object.prototype.toString = oldToString;
			if (ascending === false) {
				items.reverse();
			}
			idxById = {};
			updateIdxById();
			refresh(true);
		}

		function reSort() {
			if (sortComparer) {
				sort(sortComparer, sortAsc);
			} else if (fastSortField) {
				fastSort(fastSortField, sortAsc);
			}
		}

		function setFilter(filterFn) {
			filter = filterFn;
			if (options.inlineFilters) {
				compiledFilter = compileFilter();
				compiledFilterWithCaching = compileFilterWithCaching();
			}
			refresh();
		}

		function groupBy(valueGetter, valueFormatter, sortComparer) {
			if (! options.groupItemMetadataProvider) {
				options.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
			}

			groupingGetter = valueGetter;
			groupingGetterIsAFn = typeof groupingGetter === "function";
			groupingFormatter = valueFormatter;
			groupingComparer = sortComparer;
			collapsedGroups = {};
			groups = [];
			refresh(true);
		}

		function setAggregators(groupAggregators, includeCollapsed) {
			aggregators = groupAggregators;
			aggregateCollapsed = (includeCollapsed !== undefined)
				? includeCollapsed : aggregateCollapsed;

			// pre-compile accumulator loops
			compiledAccumulators = [];
			var idx = aggregators.length;
			while (idx --) {
				compiledAccumulators[idx] = compileAccumulatorLoop(aggregators[idx]);
			}

			refresh(true);
		}

		function getItemByIdx(i) {
			return items[i];
		}

		function getIdxById(id) {
			return idxById[id];
		}

		function ensureRowsByIdCache() {
			if (! rowsById) {
				rowsById = {};
				for (var i = 0, l = rows.length; i < l; i ++) {
					rowsById[rows[i][idProperty]] = i;
				}
			}
		}

		function getRowById(id) {
			ensureRowsByIdCache();
			return rowsById[id];
		}

		function getItemById(id) {
			return items[idxById[id]];
		}

		function mapIdsToRows(idArray) {
			var rows = [];
			ensureRowsByIdCache();
			for (var i = 0; i < idArray.length; i ++) {
				var row = rowsById[idArray[i]];
				if (row != null) {
					rows[rows.length] = row;
				}
			}
			return rows;
		}

		function mapRowsToIds(rowArray) {
			var ids = [];
			for (var i = 0; i < rowArray.length; i ++) {
				if (rowArray[i] < rows.length) {
					ids[ids.length] = rows[rowArray[i]][idProperty];
				}
			}
			return ids;
		}

		function updateItem(id, item) {
			if (idxById[id] === undefined || id !== item[idProperty]) {
				throw "Invalid or non-matching id";
			}
			items[idxById[id]] = item;
			if (! updated) {
				updated = {};
			}
			updated[id] = true;
			refresh();
		}

		function insertItem(insertBefore, item) {
			items.splice(insertBefore, 0, item);
			updateIdxById(insertBefore);
			refresh();
		}

		function addItem(item) {
			items.push(item);
			updateIdxById(items.length-1);
			refresh();
		}

		function deleteItem(id) {
			var idx = idxById[id];
			if (idx === undefined) {
				throw "Invalid id";
			}
			delete idxById[id];
			items.splice(idx, 1);
			updateIdxById(idx);
			refresh();
		}

		function getLength() {
			return rows.length;
		}

		function getItem(i) {
			return rows[i];
		}

		function getItemMetadata(i) {
			var item = rows[i];
			if (item === undefined) {
				return null;
			}

			// overrides for group rows
			if (item.__group) {
				return options.groupItemMetadataProvider.getGroupRowMetadata(item);
			}

			// overrides for totals rows
			if (item.__groupTotals) {
				return options.groupItemMetadataProvider.getTotalsRowMetadata(item);
			}

			return null;
		}

		function collapseGroup(groupingValue) {
			collapsedGroups[groupingValue] = true;
			refresh(true);
		}

		function expandGroup(groupingValue) {
			delete collapsedGroups[groupingValue];
			refresh(true);
		}

		function getGroups() {
			return groups;
		}

		function extractGroups(rows) {
			var group;
			var val;
			var groups = [];
			var groupsByVal = [];
			var r;

			for (var i = 0, l = rows.length; i < l; i ++) {
				r = rows[i];
				val = (groupingGetterIsAFn) ? groupingGetter(r) : r[groupingGetter];
				val = val || 0;
				group = groupsByVal[val];
				if (! group) {
					group = new Slick.Group();
					group.count = 0;
					group.value = val;
					group.rows = [];
					groups[groups.length] = group;
					groupsByVal[val] = group;
				}

				group.rows[group.count ++] = r;
			}

			return groups;
		}

		// TODO:  lazy totals calculation
		function calculateGroupTotals(group) {
			if (group.collapsed && ! aggregateCollapsed) {
				return;
			}

			// TODO:  try moving iterating over groups into compiled accumulator
			var totals = new Slick.GroupTotals();
			var agg, idx = aggregators.length;
			while (idx --) {
				agg = aggregators[idx];
				agg.init();
				compiledAccumulators[idx].call(agg, group.rows);
				agg.storeResult(totals);
			}
			totals.group = group;
			group.totals = totals;
		}

		function calculateTotals(groups) {
			var idx = groups.length;
			while (idx --) {
				calculateGroupTotals(groups[idx]);
			}
		}

		function finalizeGroups(groups) {
			var idx = groups.length, g;
			while (idx --) {
				g = groups[idx];
				g.collapsed = (g.value in collapsedGroups);
				g.title = groupingFormatter ? groupingFormatter(g) : g.value;
			}
		}

		function flattenGroupedRows(groups) {
			var groupedRows = [], gl = 0, g;
			for (var i = 0, l = groups.length; i < l; i ++) {
				g = groups[i];
				groupedRows[gl ++] = g;

				if (! g.collapsed) {
					for (var j = 0, jj = g.rows.length; j < jj; j ++) {
						groupedRows[gl ++] = g.rows[j];
					}
				}

				// Disabling new row with total in the bottom
				// Though, we still need the totals to be calculated above

//				if (g.totals && (! g.collapsed || aggregateCollapsed)) {
//					groupedRows[gl ++] = g.totals;
//				}
			}
			return groupedRows;
		}

		function getFunctionInfo(fn) {
			var fnRegex = /^function[^(]*\(([^)]*)\)\s*{([\s\S]*)}$/;
			var matches = fn.toString().match(fnRegex);
			return {
				params: matches[1].split(","),
				body: matches[2]
			};
		}

		function compileAccumulatorLoop(aggregator) {
			var accumulatorInfo = getFunctionInfo(aggregator.accumulate);
			var fn = new Function(
				"_items",
				"for (var " + accumulatorInfo.params[0] + ", _i=0, _il=_items.length; _i<_il; _i++) {" +
					accumulatorInfo.params[0] + " = _items[_i]; " +
					accumulatorInfo.body +
					"}"
			);
			fn.displayName = fn.name = "compiledAccumulatorLoop";
			return fn;
		}

		function compileFilter() {
			var filterInfo = getFunctionInfo(filter);

			var filterBody = filterInfo.body
				.replace(/return false[;}]/gi, "{ continue _coreloop; }")
				.replace(/return true[;}]/gi, "{ _retval[_idx++] = $item$; continue _coreloop; }")
				.replace(/return ([^;}]+?);/gi,
				"{ if ($1) { _retval[_idx++] = $item$; }; continue _coreloop; }");

			// This preserves the function template code after JS compression,
			// so that replace() commands still work as expected.
			var tpl = [
				//"function(_items, _args) { ",
				"var _retval = [], _idx = 0; ",
				"var $item$, $args$ = _args; ",
				"_coreloop: ",
				"for (var _i = 0, _il = _items.length; _i < _il; _i++) { ",
				"$item$ = _items[_i]; ",
				"$filter$; ",
				"} ",
				"return _retval; "
				//"}"
			].join("");
			tpl = tpl.replace(/\$filter\$/gi, filterBody);
			tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
			tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);

			var fn = new Function("_items,_args", tpl);
			fn.displayName = fn.name = "compiledFilter";
			return fn;
		}

		function compileFilterWithCaching() {
			var filterInfo = getFunctionInfo(filter);

			var filterBody = filterInfo.body
				.replace(/return false[;}]/gi, "{ continue _coreloop; }")
				.replace(/return true[;}]/gi, "{ _cache[_i] = true;_retval[_idx++] = $item$; continue _coreloop; }")
				.replace(/return ([^;}]+?);/gi,
				"{ if ((_cache[_i] = $1)) { _retval[_idx++] = $item$; }; continue _coreloop; }");

			// This preserves the function template code after JS compression,
			// so that replace() commands still work as expected.
			var tpl = [
				//"function(_items, _args, _cache) { ",
				"var _retval = [], _idx = 0; ",
				"var $item$, $args$ = _args; ",
				"_coreloop: ",
				"for (var _i = 0, _il = _items.length; _i < _il; _i++) { ",
				"$item$ = _items[_i]; ",
				"if (_cache[_i]) { ",
				"_retval[_idx++] = $item$; ",
				"continue _coreloop; ",
				"} ",
				"$filter$; ",
				"} ",
				"return _retval; "
				//"}"
			].join("");
			tpl = tpl.replace(/\$filter\$/gi, filterBody);
			tpl = tpl.replace(/\$item\$/gi, filterInfo.params[0]);
			tpl = tpl.replace(/\$args\$/gi, filterInfo.params[1]);

			var fn = new Function("_items,_args,_cache", tpl);
			fn.displayName = fn.name = "compiledFilterWithCaching";
			return fn;
		}

		function uncompiledFilter(items, args) {
			var retval = [], idx = 0;

			for (var i = 0, ii = items.length; i < ii; i ++) {
				if (filter(items[i], args)) {
					retval[idx ++] = items[i];
				}
			}

			return retval;
		}

		function uncompiledFilterWithCaching(items, args, cache) {
			var retval = [], idx = 0, item;

			for (var i = 0, ii = items.length; i < ii; i ++) {
				item = items[i];
				if (cache[i]) {
					retval[idx ++] = item;
				} else if (filter(item, args)) {
					retval[idx ++] = item;
					cache[i] = true;
				}
			}

			return retval;
		}

		function getFilteredAndPagedItems(items) {
			if (filter) {
				var batchFilter = options.inlineFilters ? compiledFilter : uncompiledFilter;
				var batchFilterWithCaching = options.inlineFilters ? compiledFilterWithCaching : uncompiledFilterWithCaching;

				if (refreshHints.isFilterNarrowing) {
					filteredItems = batchFilter(filteredItems, filterArgs);
				} else if (refreshHints.isFilterExpanding) {
					filteredItems = batchFilterWithCaching(items, filterArgs, filterCache);
				} else if (!refreshHints.isFilterUnchanged) {
					filteredItems = batchFilter(items, filterArgs);
				}
			} else {
				// special case:  if not filtering and not paging, the resulting
				// rows collection needs to be a copy so that changes due to sort
				// can be caught
				filteredItems = pagesize ? items : items.concat();
			}

			// get the current page
			var paged;
			if (pagesize) {
				if (filteredItems.length < pagenum * pagesize) {
					pagenum = Math.floor(filteredItems.length / pagesize);
				}
				paged = filteredItems.slice(pagesize * pagenum, pagesize * pagenum+pagesize);
			} else {
				paged = filteredItems;
			}

			return {totalRows: filteredItems.length, rows: paged};
		}

		function getRowDiffs(rows, newRows) {
			var item, r, eitherIsNonData, diff = [];
			var from = 0, to = newRows.length;

			if (refreshHints && refreshHints.ignoreDiffsBefore) {
				from = Math.max(0,
					Math.min(newRows.length, refreshHints.ignoreDiffsBefore));
			}

			if (refreshHints && refreshHints.ignoreDiffsAfter) {
				to = Math.min(newRows.length,
					Math.max(0, refreshHints.ignoreDiffsAfter));
			}

			for (var i = from, rl = rows.length; i < to; i ++) {
				if (i >= rl) {
					diff[diff.length] = i;
				} else {
					item = newRows[i];
					r = rows[i];

					if ((groupingGetter && (eitherIsNonData = (item.__nonDataRow) || (r.__nonDataRow)) &&
						item.__group !== r.__group ||
						item.__updated ||
						item.__group && !item.equals(r))
						|| (aggregators && eitherIsNonData &&
						// no good way to compare totals since they are arbitrary DTOs
						// deep object comparison is pretty expensive
						// always considering them 'dirty' seems easier for the time being
						(item.__groupTotals || r.__groupTotals))
						|| item[idProperty] != r[idProperty]
						|| (updated && updated[item[idProperty]])
					) {
						diff[diff.length] = i;
					}
				}
			}
			return diff;
		}

		function recalc(_items) {
			rowsById = null;

			if (refreshHints.isFilterNarrowing != prevRefreshHints.isFilterNarrowing
				|| refreshHints.isFilterExpanding != prevRefreshHints.isFilterExpanding
			) {
				filterCache = [];
			}

			var filteredItems = getFilteredAndPagedItems(_items);
			totalRows = filteredItems.totalRows;
			var newRows = filteredItems.rows;

			groups = [];
			if (groupingGetter != null) {
				groups = extractGroups(newRows);
				if (groups.length) {
					finalizeGroups(groups);
					if (aggregators) {
						calculateTotals(groups);
					}
					groups.sort(groupingComparer);
					newRows = flattenGroupedRows(groups);
				}
			}

			var diff = getRowDiffs(rows, newRows);

			rows = newRows;

			return diff;
		}

		function refresh(dataHasNotChanged) {
			if (suspend) {
				return;
			}

			var countBefore = rows.length;
			var totalRowsBefore = totalRows;
			var hasDataChanged = false;

//			log('totalRowsBefore', totalRowsBefore);
//			log('countBefore', countBefore);
//			log('items.length', items.length);
//			log('rows.length', rows.length);
//
			// rows = before
			// items = after

			if ( ! dataHasNotChanged) {
				if (countBefore == items.length) {
					var record, rows_length = rows.length;
					for (var i=0; i < countBefore; i++) {
						record = null;
						for (var k=0; k < rows_length; k++) {
							if (rows[k].id == items[i].id) {
								record = rows[k];
								break;
							}
						}
						for (var j in items[i]) {
							if ( ! items[i].hasOwnProperty(j)) continue;
	//						log('comparing', items[i][j], 'and', rows[i][j]);
							if ( ! record || items[i][j] !== record[j]) {
								hasDataChanged = true;
								break;
							}
						}
						if (hasDataChanged) break;
					}
				} else {
					hasDataChanged = true;
				}
			}

			var diff = recalc(items, filter); // pass as direct refs to avoid closure perf hit

			// if the current page is no longer valid, go to last page and recalc
			// we suffer a performance penalty here, but the main loop (recalc) remains highly optimized
			if (pagesize && totalRows < pagenum * pagesize) {
				pagenum = Math.floor(totalRows / pagesize);
				diff = recalc(items, filter);
			}

			updated = null;
			prevRefreshHints = refreshHints;
			refreshHints = {};

			if (totalRowsBefore != totalRows) {
//				log('triggered: onPagingInfoChanged');
				onPagingInfoChanged.notify(getPagingInfo(), null, self);
			}
			if (countBefore != rows.length) {
//				log('triggered: onRowCountChanged');
				onRowCountChanged.notify({previous: countBefore, current: rows.length}, null, self);
			}
			if (diff.length > 0) {
//				log('triggered: onRowsChanged');
				onRowsChanged.notify({rows: diff}, null, self);
			}
			if (hasDataChanged) {
//				log('triggered: onDataChanged');
				onDataChanged.notify({}, null, self);
			}
			if ( ! items.length) {
//				log('triggered: onEmptyResult');
				onEmptyResult.notify({}, null, self);
			}
		}

		function syncGridSelection(grid, preserveHidden) {
			var self = this;
			var selectedRowIds = self.mapRowsToIds(grid.getSelectedRows());
			var inHandler;

			grid.onSelectedRowsChanged.subscribe(function (e, args) {
				if (inHandler) { return; }
				selectedRowIds = self.mapRowsToIds(grid.getSelectedRows());
			});

			this.onRowsChanged.subscribe(function (e, args) {
				if (selectedRowIds.length > 0) {
					inHandler = true;
					var selectedRows = self.mapIdsToRows(selectedRowIds);
					if (! preserveHidden) {
						selectedRowIds = self.mapRowsToIds(selectedRows);
					}
					grid.setSelectedRows(selectedRows);
					inHandler = false;
				}
			});
		}

		function syncGridCellCssStyles(grid, key) {
			var hashById;
			var inHandler;

			// since this method can be called after the cell styles have been set,
			// get the existing ones right away
			storeCellCssStyles(grid.getCellCssStyles(key));

			function storeCellCssStyles(hash) {
				hashById = {};
				for (var row in hash) {
					var id = rows[row][idProperty];
					hashById[id] = hash[row];
				}
			}

			grid.onCellCssStylesChanged.subscribe(function (e, args) {
				if (inHandler) { return; }
				if (key != args.key) { return; }
				if (args.hash) {
					storeCellCssStyles(args.hash);
				}
			});

			this.onRowsChanged.subscribe(function (e, args) {
				if (hashById) {
					inHandler = true;
					ensureRowsByIdCache();
					var newHash = {};
					for (var id in hashById) {
						var row = rowsById[id];
						if (row != undefined) {
							newHash[row] = hashById[id];
						}
					}
					grid.setCellCssStyles(key, newHash);
					inHandler = false;
				}
			});
		}

		function setUrl(a_url, a_request_type) {
			url = a_url;
			request_type = a_request_type || 'POST';
		}

		function getUrl() {
			return url || App.base+'api/reports/query';
		}

		function getRequestType() {
			return request_type || 'POST';
		}

		function bindForm(selector, $grid, filters_columns_map) {
			$formFilter = $(selector);

			/**
			 * Find & Flag filtered columns
			 */
			function find_and_flag() {
				if ($grid && filters_columns_map) {
					$grid.datagrid('flag_filtered_columns', {
						filter_form:         $formFilter,
						filters_columns_map: filters_columns_map
					});
				}
			}

			$formFilter.bind('submit.dataview', function () {
				find_and_flag();
				requery();
				return false
			});

			$(function() {find_and_flag()});
		}

		function setIdProperty(field_name) {
			idProperty = field_name;
		}

		function query(query, idProperty) {
			requestQuery = query ? $.extend(true, {}, query) : requestQuery;
			if (idProperty) {
				setIdProperty(idProperty)
			}

			// Parse query filter bindings
			parsedQuery = $formFilter && $formFilter.length
				? parseQueryFilters(requestQuery)
				: requestQuery;

			var dataParams = {};
			if (parsedQuery && request_type && request_type.toUpperCase() == 'GET') {
				$.each(parsedQuery.filter, function (i, filter) {
					dataParams[filter[0]] = filter[2];
				});
			} else {
				dataParams = JSON.stringify(parsedQuery);
			}

			$.ajaxQueue({
				url: url || App.base+'api/reports/query',
				type: request_type || 'POST',
				data: dataParams,
				success: function (response) {

					// Add an indexed unique key that DataView is expecting
					if (response.payload && response.payload[0] && ! response.payload[0][idProperty]) {
						if (parsedQuery && parsedQuery.group) {
							idProperty = $.extend([], parsedQuery.group);
						}
						var id_array = $.isArray(idProperty);
						$.each(response.payload, function (i, record) {
							if (id_array) {
								record.id = '';
								$.each(idProperty, function (i, group) {
									// if group is still array, this is an alias, use [1]
									record.id += record[$.isArray(group) ? group[1] : group];
								});
							} else {
								record.id = record[idProperty];
							}
						});
					}

					// initialize the model after all the events have been hooked up
//					beginUpdate();
					setItems(response.payload);
//					log('updating response payload into dataview');
//					setFilterArgs({
//						percentCompleteThreshold: percentCompleteThreshold,
//							searchString: searchString
//					});
//					setFilter(myFilter);
//					endUpdate();

					if (groupingGetter != null) {
						// Collapse all groups by default after group extract (endUpdate)
						var theGroups = getGroups();
						for (var i = 0; i < theGroups.length; i++) {
							collapsedGroups[theGroups[i].value] = true;
						}
						refresh(true);
					}
				}
			});
		}

		function requery() {
			return query(false, idProperty);
		}

		function getRequestQuery() {
			return parsedQuery;
		}

		/**
		 * Parses bind form inputs to query
		 *
		 * @param {Object} query
		 */
		function parseQueryFilters(query) {
			var filter_regex = /^bind\((.*)\)$/,
				parsedQuery  = $.extend(true, {}, query),
				filter, matches, selector, val, timestamp, $inp, type;

			// Check filter form bind
			if ( ! $formFilter.length) return query;

			// Empty filters
			parsedQuery.filter = [];

			for (var i = 0, filter_count = query.filter.length; i < filter_count; i++) {
				filter = query.filter[i];
				if (filter_regex.test(filter[2])) {
					matches = filter_regex.exec(filter[2]);
					if (matches.length == 2) {
						selector = '[name="'+matches[1]+'"]';
						$inp = $formFilter.find('input'+selector+', select'+selector).eq(0);
						type = $inp.attr('type');
						val = $inp.val();

						// If field has been initialized with datepicker, reformat date value
						// TODO: Can this be better somehow?
						if (val && $inp.hasClass('hasDatepicker')) {
							timestamp = $.datepicker.parseDate('dd-mm-yy', val);
							val = $.datepicker.formatDate('yy-mm-dd', timestamp);
						}

						// Use filter, unless it's an unchecked checkbox input or value is identical to placeholder
						if (val && val != $inp.attr('placeholder') && (type != 'checkbox' || $inp.is(':checked'))) {
							parsedQuery.filter.push([ filter[0], filter[1], val ]);
						}
					}
				} else {
					parsedQuery.filter.push(filter);
				}
			}
			return parsedQuery;
		}

		function setSortInfo(column, direction) {
			sortInfo.column = column;
			sortInfo.direction = direction;
		}

		function getSortInfo() {
			return sortInfo;
		}

		function getGroupGetter() {
			return groupingGetter;
		}

		return {
			// ajax/querying and binding methods
			"setUrl": setUrl,
			"getUrl": getUrl,
			"getRequestType": getRequestType,
			"bindForm": bindForm,
			"query": query,
			"requery": requery,
			"getRequestQuery": getRequestQuery,
			"getGroupGetter": getGroupGetter,

			// methods
			"beginUpdate": beginUpdate,
			"endUpdate": endUpdate,
			"setPagingOptions": setPagingOptions,
			"getPagingInfo": getPagingInfo,
			"getItems": getItems,
			"setItems": setItems,
			"setFilter": setFilter,
			"sort": sort,
			"fastSort": fastSort,
			"reSort": reSort,
			"groupBy": groupBy,
			"setAggregators": setAggregators,
			"collapseGroup": collapseGroup,
			"expandGroup": expandGroup,
			"getGroups": getGroups,
			"getIdxById": getIdxById,
			"getRowById": getRowById,
			"getItemById": getItemById,
			"getItemByIdx": getItemByIdx,
			"mapRowsToIds": mapRowsToIds,
			"mapIdsToRows": mapIdsToRows,
			"setRefreshHints": setRefreshHints,
			"setFilterArgs": setFilterArgs,
			"refresh": refresh,
			"updateItem": updateItem,
			"insertItem": insertItem,
			"addItem": addItem,
			"deleteItem": deleteItem,
			"syncGridSelection": syncGridSelection,
			"syncGridCellCssStyles": syncGridCellCssStyles,
			"setSortInfo": setSortInfo,
			"getSortInfo": getSortInfo,

			// data provider methods
			"getLength": getLength,
			"getItem": getItem,
			"getItemMetadata": getItemMetadata,

			// events
			"onRowCountChanged": onRowCountChanged,
			"onRowsChanged": onRowsChanged,
			"onPagingInfoChanged": onPagingInfoChanged,
			"onDataChanged": onDataChanged,
			"onEmptyResult": onEmptyResult
		};
	}

	function AvgAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.count_ = 0;
			this.nonNullCount_ = 0;
			this.sum_ = 0;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			this.count_ ++;
			if (val != null && val != "" && val != NaN) {
				this.nonNullCount_ ++;
				this.sum_ += parseFloat(val);
			}
		};

		this.storeResult = function (groupTotals) {
			if (! groupTotals.avg) {
				groupTotals.avg = {};
			}
			if (this.nonNullCount_ != 0) {
				groupTotals.avg[this.field_] = this.sum_ / this.nonNullCount_;
			}
		};
	}

	function MinAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.min_ = null;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			if (val != null && val != "" && val != NaN) {
				if (this.min_ == null || val < this.min_) {
					this.min_ = val;
				}
			}
		};

		this.storeResult = function (groupTotals) {
			if (! groupTotals.min) {
				groupTotals.min = {};
			}
			groupTotals.min[this.field_] = this.min_;
		}
	}

	function MaxAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.max_ = null;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			if (val != null && val != "" && val != NaN) {
				if (this.max_ == null || val > this.max_) {
					this.max_ = val;
				}
			}
		};

		this.storeResult = function (groupTotals) {
			if (! groupTotals.max) {
				groupTotals.max = {};
			}
			groupTotals.max[this.field_] = this.max_;
		}
	}

	function SumAggregator(field) {
		this.field_ = field;

		this.init = function () {
			this.sum_ = null;
		};

		this.accumulate = function (item) {
			var val = item[this.field_];
			if (val != null && val != "" && val != NaN) {
				this.sum_ += parseFloat(val);
			}
		};

		this.storeResult = function (groupTotals) {
			if (! groupTotals.sum) {
				groupTotals.sum = {};
			}
			groupTotals.sum[this.field_] = this.sum_;
		}
	}

	// TODO:  add more built-in aggregators
	// TODO:  merge common aggregators in one to prevent needles iterating

})(jQuery);