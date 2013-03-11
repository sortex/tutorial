/**
 * User client-side controller
 * - For register/login/forgot/reset
 *
 * @package    Ongage\User
 * @category   Client-side
 * @author     Yakir Hanoch <yakir@sortex.co.il>
 * @copyright  Copyright (C) 2010 - 2012 Ongage, LTD. All rights reserved.
 * @license    Ongage, 2010-2012
 * @link       http://www.ongage.com
 */
App.controllers.user = {

	/**
	 * user/register
	 */
	register: function () {
		// Toggle password input "Show Password"
		$('#show_password').bind('change', function() {
			document.getElementById('password').type = $(this).is(':checked') ? 'text' : 'password';
		});

		var $re_captcha = $('#recaptcha'),
			$captcha_img = $('#captcha_img').find('img'),
			captcha_count = 1,
			_is_submitted = false;

		// Setup Re-Captcha
		$re_captcha.bind('click', function() {
			$.ajax({
				type: 'GET',
				url: $re_captcha.attr('href'),
				dataType: 'json',
				success: function (response) {
					App.widgets.process_response(response, {
						onSuccess: function() {
							if (response.captcha) {
								// Switching captcha images (Changing image source so it will be rendered)
								$captcha_img.attr('src', $(response.captcha).attr('src')+'?'+captcha_count);
								captcha_count++;
							}
						}
					});
				}
			});
			return false;
		});

		// Prevent multiple submits on register form
		$('form').bind('submit', function() {
			if (_is_submitted) { return false; }
			_is_submitted = true;
			return true;
		});
	}
};