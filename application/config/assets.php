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
		array('style',  'css/formalize.css',                         'head', 0),
		array('style',  'css/libs/jquery-ui-1.9.1.custom.css',       'head', 10),
		array('style',  'css/notices.css',                           'head', 20),
		array('style',  'css/template.css',                          'head', 30),
		array('style',  'css/slickgrid.css',                         'head', 30),
		array('script', 'js/libs/jquery-1.7.2.min.js',               'body', 160),
		array('script', 'js/libs/jquery-ui-1.9.1.custom.min.js',     'body', 161),
		array('script', 'js/libs/jquery.cookie.js',                  'body', 165),
		array('script', 'js/libs/jquery.pagination.js',              'body', 170),
		array('script', 'js/app.js',                                 'body', 210),
		array('script', 'js/notices.js',                             'body', 220),
//		array('script', 'js/_widgets.js',                            'body', 220),
//		array('script', 'js/helpers.js',                             'body', 500),
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

	'user' => array(
		array('script', 'js/controllers/user.js',                  'body', 1000)
	),

	'jobs' => array(
		array('script', 'js/controllers/jobs.js',                  'body', 1000)
	),

);
