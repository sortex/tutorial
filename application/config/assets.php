<?php defined('SYSPATH') or die('No direct script access.');
/**
 * This is where assets and asset dependencies are defined.
 *
 * @package    Ongage
 * @copyright  Copyright (C) 2010 - 2012 Ongage, LTD. All rights reserved.
 * @license    Ongage, 2010-2012
 * @link       http://www.ongage.com
 */
return array
(

	'default' => array(
//		array('[style/script]', '[path]', '[section]', [weight]),
		array('style',  'css/reset.css',                             'head', 0),
		array('style',  'css/formalize.css',                         'head', 5),
		array('style',  'css/libs/jquery-ui-1.9.1.custom.css',       'head', 10),
		array('style',  'css/libs/tooltip.css',                      'head', 20),
//		array('style',  'css/notices.css',                           'head', 30),
//		array('style',  'css/table.css',                             'head', 40),
//		array('style',  'css/layout.css',                            'head', 50),
//		array('style',  'css/form.css',                              'head', 60),
//		array('style',  'css/screen.css',                            'head', 70),
//		array('style',  'css/screen-big.css',                        'head', 71),
//		array('style',  'css/screen-bigger.css',                     'head', 72),
//		array('style',  'css/iphone.css',                            'head', 80),
		array('style',  'compiled/screen.css',                       'head', 100),
		array('script', 'js/libs/jquery-1.7.2.min.js',               'body', 160),
		array('script', 'js/libs/jquery-ui-1.9.1.custom.min.js',     'body', 161),
		array('script', 'js/libs/jquery-ui-timepicker-addon.js',     'body', 162),
		array('script', 'js/libs/jquery.maskedinput.js',             'body', 163),
		array('script', 'js/libs/jquery.formalize.js',               'body', 164),
		array('script', 'js/libs/jquery.cookie.js',                  'body', 165),
		array('script', 'js/libs/json2.js',                          'body', 166),
		array('script', 'js/libs/mustache.min.js',                   'body', 167),
		array('script', 'js/libs/icanhaz-no-mustache.min.js',        'body', 168),
		array('script', 'js/libs/bootstrap-tooltip.js',              'body', 169),
		array('script', 'js/libs/jquery.pagination.js',              'body', 170),
		array('script', 'js/libs/highcharts.js',                     'body', 171),
		array('script', 'js/libs/exporting.js',                      'body', 172),
		array('script', 'js/libs/jquery.filestyle.min.js',           'body', 173),
		array('script', 'js/libs/funnel.src.js',                     'body', 174),
		array('script', 'js/libs/htmltotext.js',                     'body', 175),
		array('script', 'js/libs/moment.min.js',                     'body', 176),
		array('script', 'js/charterize.js',                          'body', 177),
		array('script', 'js/charts.js',                              'body', 178),
		array('script', 'js/app.js',                                 'body', 210),
		array('script', 'js/notices.js',                             'body', 220),
		array('script', 'js/tabler.js',                              'body', 500),
		array('script', 'js/email.js',                               'body', 510),
		array('script', 'js/_widgets.js',                            'body', 220),
		array('script', 'js/helpers.js',                             'body', 500),
		array('script', 'js/_init.js',                               'body', 530),
	),

	// Plugins ---------------------------------------------------------------------------------

	'slickgrid' => array(
		array('script', 'js/libs/jquery.event.drag-2.0.min.js',             'body', 5000),
		array('script', 'js/libs/slickgrid/slick.core.js',                  'body', 5001),
		array('script', 'js/libs/slickgrid/slick.grid.js',                  'body', 5002),
		array('script', 'js/libs/slickgrid/plugins/slick.autotooltips.js',  'body', 5003),
		array('script', 'js/datagrid.editors.js',                           'body', 5004),
		array('script', 'js/datagrid.groupitemmetadataprovider.js',         'body', 5005),
		array('script', 'js/datagrid.formatters.js',                        'body', 5006),
		array('script', 'js/dataview.js',                                   'body', 5007),
		array('script', 'js/remotemodel.js',                                'body', 5008),
		array('script', 'js/datagrid.js',                                   'body', 5009),
		array('script', 'js/datagrid.buttons.js',                           'body', 5010),
		array('script', 'js/datagrid.columnpicker.js',                      'body', 5011),
		array('style',  'js/libs/slickgrid/slick.grid.css',                 'head', 500),
	),

	'library' => array(
		array('script', 'js/_library.js',                           'body', 5000),
	),

	'form' => array(
		array('script', 'js/libs/jquery.form.js',                   'body', 5000),
	),

	'fullcalendar' => array(
		array('script', 'js/libs/fullcalendar/fullcalendar.min.js', 'body', 5000),
		array('style',  'js/libs/fullcalendar/fullcalendar.css',    'head', 5001),
	),

	'fusioncharts' => array(
		array('script', 'js/libs/fusioncharts.js',                  'body', 5000),
	),

	'jit' => array(
		array('script', 'js/libs/jit.custom.min.js',                'body', 5000),
	),

	'ckeditor' => array(
		array('script', 'js/libs/ckeditor/ckeditor.js',             'body', 600),
		array('script', 'js/ckeditor-en.js',                        'body', 602),
		array('script', 'js/libs/ckeditor/adapters/jquery.js',      'body', 604),
	),

	'select2' => array(
		array('style',  'css/libs/select2.css',                     'body', 606),
		array('script', 'js/libs/select2/select2.min.js',           'body', 600),
	),

	'fileupload' => array(
		array('script', 'js/libs/load-image.js',                    'body', 600),
		array('script', 'js/libs/canvas-to-blob.js',                'body', 601),
		array('style',  'css/libs/jquery.fileupload-ui.css',        'body', 5000),
		array('script', 'js/libs/jquery.iframe-transport.js',       'body', 5000),
		array('script', 'js/libs/jquery.fileupload.js',             'body', 5001),
		array('script', 'js/libs/jquery.fileupload-fp.js',          'body', 5002),
		array('script', 'js/libs/jquery.fileupload-ui.js',          'body', 5003),
		array('script', 'js/libs/jquery.fileupload-jui.js',         'body', 5004),
	),

	'cycle' => array(
		array('script', 'js/libs/jquery.cycle.all.js',             'body', 1000),
	),

	// Controllers -----------------------------------------------------------------------------

	'list' => array(
		array('script', 'js/controllers/list.js',                  'body', 1000)
	),

	'home' => array(
		array('script', 'js/controllers/home.js',                  'body', 1000)
	),

	'campaign' => array(
		array('script', 'js/controllers/campaign.js',              'body', 1000)
	),

	'split' => array(
		array('script', 'js/controllers/split.js',                 'body', 1000)
	),

	'events' => array(
		array('script', 'js/controllers/events.js',                'body', 1000)
	),

	'content' => array(
		array('script', 'js/controllers/content.js',               'body', 1000)
	),

	'images' => array(
		array('script', 'js/controllers/images.js',                'body', 1000)
	),

	'deliverability' => array(
		array('script', 'js/controllers/deliverability.js',        'body', 1000)
	),

	'networking' => array(
		array('script', 'js/controllers/networking.js',            'body', 1000),
	),

	'settings' => array(
		array('script', 'js/controllers/settings.js',              'body', 1000),
	),

	'analytics' => array(
		array('script', 'js/controllers/analytics.js',             'body', 1000)
	),

	'user' => array(
		array('script', 'js/controllers/user.js',                  'body', 1000)
	),

	'email' => array(
		array('script', 'js/controllers/email.js',                 'body', 1000)
	),

	'help' => array(
		array('script', 'js/controllers/help.js',                  'body', 1000)
	),

);
