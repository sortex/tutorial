/***
 * Contains basic SlickGrid formatters.
 * @module Formatters
 * @namespace Slick
 */

(function ($) {

	// register namespace
	$.extend(true, window, {
		"Slick": {
			"Formatters": {
				"PercentComplete": PercentCompleteFormatter,
				"PercentCompleteBar": PercentCompleteBarFormatter,
				"NumberFormat": NumberFormat,
				"YesNo": YesNoFormatter,
				"Checkmark": CheckmarkFormatter,
				"xvIcon": xvIcon,
				"Date": DateFormatter,
				"StatusFormatter": StatusFormatter,
				"StatusDescFormatter": StatusDescFormatter,
				"SegmentTypes": SegmentTypes,
				"ExportDownloadLink": ExportDownloadLink,
				"ESPInfo": ESPInfo,
				"ContactForm": ContactForm,
				"NetworkingESPSetup": NetworkingESPSetup,
				"PercentFormatter": PercentFormatter,
				"FloorPercent": FloorPercent,
				"SplitItemA": SplitItemA,
				"SplitItemB": SplitItemB,
				"CampaignName": CampaignName,
				"TransactionalName": TransactionalName,
				"EmailForm": EmailForm,
				"Favorite": FavoriteFormatter,
				"SegmentCount": SegmentCount,
				"GroupSumTotalsFormatter": GroupSumTotalsFormatter,
				"ImportTypeReport": ImportTypeReport,
				"MailingLinks": MailingLinks,

				// Utilities
				"rmBubbleEvt": rmBubbleEvt
			}
		}
	});

	function PercentCompleteFormatter(row, cell, value, columnDef, dataContext) {
		if (value == null || value === "") {
			return "-";
		} else {
			if (value < 50) {
				return "<span style='color:red;font-weight:bold;'>"+value+"%</span>";
			} else {
				return "<span style='color:green'>"+value+"%</span>";
			}
		}
	}

	function PercentCompleteBarFormatter(row, cell, value, columnDef, dataContext) {
		if (value == null || value === "") {
			return "";
		}

		var color;

		if (value < 30) {
			color = "red";
		} else {
			if (value < 70) {
				color = "silver";
			} else {
				color = "green";
			}
		}

		return "<span class='percent-complete-bar' style='background:"+color+";width:"+value+"%'></span>";
	}

	function NumberFormat(row, cell, value, columnDef, dataContext) {
		return Highcharts.numberFormat(value, 0);
	}

	function YesNoFormatter(row, cell, value, columnDef, dataContext) {
		return value ? "Yes" : "No";
	}

	function CheckmarkFormatter(row, cell, value, columnDef, dataContext) {
		return value ? "<img src='"+App.media_base+"img/slickgrid/tick.png'>" : "";
	}

	function xvIcon(row, cell, value, columnDef, dataContext) {
		return value == '1' ? '<span class="xv-icon v-icon">1</span>' : '<span class="xv-icon x-icon">0</span>';
	}

	function DateFormatter(row, cell, value, columnDef, dataContext) {
		var parse = columnDef.parse || '@',
			format = columnDef.format || 'DD MMM YY';

		// Unix time is stored in seconds while Javascript uses milliseconds
		if (parse == '@' && value) {
			value *= 1000;
		}

		return value ? moment.utc(value).format(format) : '--';
	}

	function StatusFormatter(row, cell, value, columnDef, dataContext) {
		if ( ! value) return '';
		var status_class = 'status status_'+dataContext.status;

		return dataContext.comment
			? '<span class="info2 '+status_class+'" title="'+dataContext.comment+'">'+value+'</span>'
			: '<span class="'+status_class+'">'+value+'</span>';
	}

	function StatusDescFormatter(row, cell, value, columnDef, dataContext) {
		var status_class = 'status status_'+dataContext.status_desc;
		return value ? '<span class="'+status_class+'">'+value+'</span>' : '';
	}

	function SegmentTypes(row, cell, value, columnDef, dataContext) {
		var status_class = 'status status_'+dataContext.type;
		return value ? '<span class="'+status_class+'">'+value+'</span>' : '';
	}

	function ExportDownloadLink(row, cell, value, columnDef, dataContext) {
		var href = App.base+'list/serve_export/?f='+value;
		return value ? '<a href="'+href+'" target="_blank">'+value+'</a>' : '';
	}

	function ESPInfo(row, cell, value, columnDef, dataContext) {
		var href = App.base+'deliverability/espinfo/'+dataContext.esp_id;

		return '<a href="'+href+'" class="espinfo">'
				+'<span class="icon preview"></span>'
				+'<img src="'+App.base+'uploads/esps/'+(dataContext.logo ? dataContext.logo : 'blank.jpg')+'" class="esp-logo outsetborders" />'
				+value+'</a>';
	}

	function ContactForm(row, cell, value, columnDef, dataContext) {
		var href = App.base+'networking/contactform/'+dataContext.esp_id;
		value = $.trim(value);
		value = value ? value : 'Add Contact Info';
		return '<a href="'+href+'" class="contact-form">'+value+'</a>';
	}

	// Define ESP setup action texts for tooltip
	var action_texts = {
		bounce_domain: 'Bounce Domain',
		credentials:   'Credentials',
		from_name:     'From Name',
		from_address:  'From Address',
		reply_address: 'Reply Address'
	};

	// Setup ESP Setup formatter - V check mark / In Progress / Canceled status
	function NetworkingESPSetup(row, cell, value, columnDef, dataContext) {
		if (parseInt(dataContext.deleted, 10))
			return '<span class="status status_Deleted">Canceled</span>';

		// ESP Setup completed
		if (parseInt(value)) {
			return '<span class="xv-icon v-icon">1</span>';
		}
		else {
			// Prepare ESP setup to do tooltip
			var todo_actions = ESPS_TODO_LIST[dataContext.esp_id],
				$header = $('<span />').text('Actions to complete setup:');
				$ul     = $('<ul />');

			if (todo_actions) {
				// Add to do action texts to unordered list
				$.each(todo_actions, function(action, status) {
					if (status) {
						$ul.append($('<li />').text(action_texts[action]));
					}
				});
			}

			return '<span class="status status_Active info2" title="'+($('<div />').append($header).append($ul).html())+'">In Progress</span>';
		}
	}

	// Defining dividends / devisors for percent formatter
	// Example: { sent = 100, success = 55 -> percent = success/sent*100 = 55(%) }
	var dividends_devisors = {
		success:       [ 'success',       'sent' ],
		failed:        [ 'failed',        'sent' ],
		opens:         [ 'opens',         'success' ],
		clicks:        [ 'clicks',        'opens' ],
		hard_bounces:  [ 'hard_bounces',  'sent' ],
		soft_bounces:  [ 'soft_bounces',  'sent' ],
		unsubscribes:  [ 'unsubscribes',  'success' ],
		complaints:    [ 'complaints',    'success' ],
		unique_clicks: [ 'unique_clicks', 'opens' ],
		ctr:           [ 'clicks',        'success' ]
	};

	function PercentFormatter(row, cell, value, columnDef, dataContext) {
		var dividend = parseInt(dataContext[dividends_devisors[columnDef.field][0]], 10),
			divisor  = parseInt(dataContext[dividends_devisors[columnDef.field][1]], 10),
			quotient = parseFloat(divisor ? (dividend * 100.0 / divisor).toFixed(1) : 0);

		// For fields without values (only percents, i.e. ctr)
		if (value === undefined) { return quotient ? Highcharts.numberFormat(quotient, 0)+'%' : '0.0%' }

		value = parseInt(value, 10);

		return value ? Highcharts.numberFormat(value, 0)+' ('+Highcharts.numberFormat(quotient, 0)+'%)' : '0 (0.0%)';
	}

	function GroupSumTotalsFormatter(totals, columnDef) {
		var value = totals.sum[columnDef.field];
		if (dividends_devisors[columnDef.field]) {
			var dividend = parseInt(totals.sum[dividends_devisors[columnDef.field][0]], 10),
				divisor  = parseInt(totals.sum[dividends_devisors[columnDef.field][1]], 10),
				quotient = parseFloat(divisor ? (dividend * 100.0 / divisor).toFixed(1) : 0);

			// For fields without values (only percents, i.e. ctr)
			if (value === undefined) { return quotient ? Highcharts.numberFormat(quotient, 0)+'%' : '0.0%' }

			value = value ? Highcharts.numberFormat(value, 0)+' ('+Highcharts.numberFormat(quotient, 0)+'%)' : '0 (0.0%)';
		} else {
			value = Highcharts.numberFormat(value, 0);
		}

		return value;
	}

	function SplitItemA(row, cell, value, columnDef, dataContext) {
		return '<a href="#" rel="'+dataContext.item_a_id+'" class="split-item split-'+dataContext.split_type+'">'+value+'</a>';
	}

	function SplitItemB(row, cell, value, columnDef, dataContext) {
		return '<a href="#" rel="'+dataContext.item_b_id+'" class="split-item split-'+dataContext.split_type+'">'+value+'</a>';
	}

	function FloorPercent(row, cell, value, columnDef, dataContext) {
		return Math.floor(value)+'%';
	}

	function CampaignName(row, cell, value, columnDef, dataContext) {
		return dataContext.type == 'split' ? value+' (A/B - '+dataContext.split_type+')' : value;
	}

	function TransactionalName(row, cell, value, columnDef, dataContext) {
		return value+ ' <span class="info2 help" title="This campaign holds the stats of all transactional emails that were not associated with a specific transactional campaign">(?)</span>';
	}

	function EmailForm(row, cell, value, columnDef, dataContext) {
		var email_name_html;

		if (dataContext.split_type == 'email') {
			var email_ids = dataContext.email_id.split(','),
				email_names = dataContext.email_name.split(',');

			if ( ! email_names[1]) {
				email_names[1] = email_names[0];
			}

			email_name_html = '<a href="'+App.base+'email/form/'+email_ids[0]+'?ref=campaign" class="info" title="Edit Email A">'+email_names[0]+'</a>'+' / '
				+'<a href="'+App.base+'email/form/'+email_ids[1]+'?ref=campaign" class="info" title="Edit Email B">'+email_names[1]+'</a>';

		} else {
			email_name_html = '<a href="'+App.base+'email/form/'+dataContext.email_id+'?ref=campaign" class="info" title="Edit Email">'+value+'</a>';
		}

		dataContext.email_name = email_name_html;

		return email_name_html;
	}

	function FavoriteFormatter(row, cell, value, columnDef, dataContext) {
		var href = App.base+columnDef.href+'/'+dataContext.id,
			title = value == '1' ? 'Unset Favorite' : 'Set as Favorite';

		return '<div class="btn-group"><a href="'+href+'" class="info icon favorite state-'+value+'" title="'+title+'"></a></div>';
	}

	function ImportTypeReport(row, cell, value, columnDef, dataContext) {
		// Import type report only available for Completed imports
		if ( ! parseInt(value, 10) || dataContext.status != '40003') { return value; }

		var columns   = [{ fld: 'email', name: 'email', type: '' }],
			csv_title = encodeURIComponent('Import #'+dataContext.id+' - \''+columnDef.id+'\' Report'),
			href      = App.base+'api/lists.csv/import_report?title='+csv_title+'&import_id='+dataContext.id+'&type='+columnDef.id+'&columns='+encodeURIComponent(JSON.stringify(columns));

		return '<a href="'+href+'" class="info" title="Click here to download a detailed CSV file" target="_blank">'+value+'</a>';
	}

	function SegmentCount(row, cell, value, columnDef, dataContext) {
		return (parseInt(dataContext.last_count_date, 10)) ? value : 'Counting...';
	}

	function MailingLinks(row, cell, value, columnDef, dataContext) {
		if ( ! value) { return value; }

		// Format percent value
		value = PercentFormatter(row, cell, value, columnDef, dataContext);

		return '<a href="#" class="info mailing_links" title="Campaign links & Clicks" data-mailing-id="'+dataContext.mailing_id+'">'+value+'</a>';
	}

	// Utilities ****************************************************************************

	function rmBubbleEvt(e) {
		e = e || event;
		e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
	}

})(jQuery);