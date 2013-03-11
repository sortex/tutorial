<?php defined('SYSPATH') or die('No direct script access.');
/**
 * Extends Kohana Text helper - Prepend media/ to all media files
 *
 * @package    Ongage\Helpers
 * @copyright  Copyright (C) 2010 - 2012 Ongage, LTD. All rights reserved.
 * @license    Ongage, 2010-2012
 * @link       http://www.ongage.com
 */
class HTML extends Kohana_HTML {

	/**
	 * Creates a script link.
	 *
	 * @see Kohana_HTML::script
	 */
	public static function script($file, array $attributes = NULL, $protocol = NULL, $index = FALSE)
	{
		// Adding the cache buster prefix.  See kohana-media module
		return parent::script('media/'.$file, $attributes, $protocol, $index);
	}

	/**
	 * Creates a style sheet link element.
	 *
	 * @see Kohana_HTML::style
	 */
	public static function style($file, array $attributes = NULL, $protocol = NULL, $index = FALSE)
	{
		// Adding the cache buster prefix.  See kohana-media module
		return parent::style('media/'.$file, $attributes, $protocol, $index);
	}

} // End HTML