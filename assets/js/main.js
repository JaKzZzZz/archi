(function ($) {

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// брейкпоинты
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: ['361px', '480px'],
		xxsmall: [null, '360px']
	});

	// анимации страницы загрузки
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// фикс бага флексбокса
	if (browser.name == 'ie') {

		var flexboxFixTimeoutId;

		$window.on('resize.flexbox-fix', function () {

			clearTimeout(flexboxFixTimeoutId);

			flexboxFixTimeoutId = setTimeout(function () {

				if ($wrapper.prop('scrollHeight') > $window.height())
					$wrapper.css('height', 'auto');
				else
					$wrapper.css('height', '100vh');

			}, 250);

		}).triggerHandler('resize.flexbox-fix');

	}

	// нав
	var $nav = $header.children('nav'),
		$nav_li = $nav.find('li');

	if ($nav_li.length % 2 == 0) {

		$nav.addClass('use-middle');
		$nav_li.eq(($nav_li.length / 2)).addClass('is-middle');

	}

	// мейн
	var delay = 325,
		locked = false;

	// методы
	$main._show = function (id, initial) {

		var $article = $main_articles.filter('#' + id);

		// пофигизм
		if ($article.length == 0)
			return;


		// ещё больше исключений
		if (locked || (typeof initial != 'undefined' && initial === true)) {

			$body.addClass('is-switching');

			$body.addClass('is-article-visible');

			$main_articles.removeClass('active');

			$header.hide();
			$footer.hide();

			$main.show();
			$article.show();

			$article.addClass('active');

			locked = false;

			setTimeout(function () {
				$body.removeClass('is-switching');
			}, (initial ? 1000 : 0));

			return;

		}

		// лок
		locked = true;

		// смена артиклов
		if ($body.hasClass('is-article-visible')) {

			// деактивация текущего артикла
			var $currentArticle = $main_articles.filter('.active');

			$currentArticle.removeClass('active');

			// показать артикл
			setTimeout(function () {

				$currentArticle.hide();

				$article.show();

				setTimeout(function () {

					$article.addClass('active');

					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					setTimeout(function () {
						locked = false;
					}, delay);

				}, 25);

			}, delay);

		}

		// в ином случае
		else {

			$body
				.addClass('is-article-visible');

			setTimeout(function () {

				$header.hide();
				$footer.hide();

				$main.show();
				$article.show();

				setTimeout(function () {

					$article.addClass('active');

					$window
						.scrollTop(0)
						.triggerHandler('resize.flexbox-fix');

					setTimeout(function () {
						locked = false;
					}, delay);

				}, 25);

			}, delay);

		}

	};

	$main._hide = function (addState) {

		var $article = $main_articles.filter('.active');

		if (!$body.hasClass('is-article-visible'))
			return;

		if (typeof addState != 'undefined'
			&& addState === true)
			history.pushState(null, null, '#');

		if (locked) {

			$body.addClass('is-switching');

			$article.removeClass('active');

			$article.hide();
			$main.hide();

			$footer.show();
			$header.show();

			$body.removeClass('is-article-visible');

			locked = false;

			$body.removeClass('is-switching');

			$window
				.scrollTop(0)
				.triggerHandler('resize.flexbox-fix');

			return;

		}

		locked = true;

		$article.removeClass('active');

		setTimeout(function () {

			$article.hide();
			$main.hide();

			$footer.show();
			$header.show();

			setTimeout(function () {

				$body.removeClass('is-article-visible');

				$window
					.scrollTop(0)
					.triggerHandler('resize.flexbox-fix');

				setTimeout(function () {
					locked = false;
				}, delay);

			}, 25);

		}, delay);


	};

	$main_articles.each(function () {

		var $this = $(this);

		$('<div class="close">Close</div>')
			.appendTo($this)
			.on('click', function () {
				location.hash = '';
			});

		$this.on('click', function (event) {
			event.stopPropagation();
		});

	});

	$body.on('click', function (event) {

		if ($body.hasClass('is-article-visible'))
			$main._hide(true);

	});

	$window.on('keyup', function (event) {

		switch (event.keyCode) {

			case 27:
				if ($body.hasClass('is-article-visible'))
					$main._hide(true);

				break;

			default:
				break;

		}

	});

	$window.on('hashchange', function (event) {

		if (location.hash == ''
			|| location.hash == '#') {

			event.preventDefault();
			event.stopPropagation();

			$main._hide();

		}

		else if ($main_articles.filter(location.hash).length > 0) {

			event.preventDefault();
			event.stopPropagation();

			$main._show(location.hash.substr(1));

		}

	});

	if ('scrollRestoration' in history)
		history.scrollRestoration = 'manual';
	else {

		var oldScrollPos = 0,
			scrollPos = 0,
			$htmlbody = $('html,body');

		$window
			.on('scroll', function () {

				oldScrollPos = scrollPos;
				scrollPos = $htmlbody.scrollTop();

			})
			.on('hashchange', function () {
				$window.scrollTop(oldScrollPos);
			});

	}

	$main.hide();
	$main_articles.hide();

	if (location.hash != ''
		&& location.hash != '#')
		$window.on('load', function () {
			$main._show(location.hash.substr(1), true);
		});

})(jQuery);