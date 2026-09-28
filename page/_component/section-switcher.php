<?php
use App\Site\Theme;
use Gt\Dom\Element;
use Gt\Http\Uri;
use Gt\Http\ServerRequest;

function go(Element $element, Uri $uri, ServerRequest $request):void {
	foreach($element->querySelectorAll(".section-form option") as $option) {
		if(trim($uri->getPath(), "/") === "library/{$option->value}"
			|| ($option->value === "playground" && preg_match("~^/playground(?:/|$)~", $uri->getPath()))) {
			$option->setAttribute("selected", "");
		}
	}
	foreach($element->querySelectorAll('.theme-form select[name="theme"] option') as $option) {
		if($option->value === Theme::current($request)) {
			$option->setAttribute("selected", "");
		}
	}
	$scheme = Theme::scheme($request);
	if($scheme !== "system") {
		$element->querySelector('input[type="radio"][value="' . $scheme . '"]')->setAttribute("checked", "");
	}
	$tint = Theme::tint($request);
	$tintInput = $element->querySelector('input[name="tint"]');
	$presetTint = Theme::presetTint(Theme::current($request), $scheme);
	$tintInput->setAttribute("value", $tint ?? $presetTint);
	$tintInput->setAttribute("data-custom", $tint ? "true" : "false");
	$element->querySelector('input[name="tint-preset"]')->setAttribute("value", $presetTint);
	$primary = Theme::primary($request);
	$primaryInput = $element->querySelector('input[name="primary"]');
	$presetPrimary = Theme::presetPrimary(Theme::current($request), $scheme);
	$primaryInput->setAttribute("value", $primary ?? $presetPrimary);
	$primaryInput->setAttribute("data-custom", $primary ? "true" : "false");
	$element->querySelector('input[name="primary-preset"]')->setAttribute("value", $presetPrimary);
}
