<?php
use App\Site\Theme;
use Gt\Dom\Element;
use Gt\Http\ServerRequest;

function go(Element $element, ServerRequest $request):void {
	$theme = Theme::current($request);
	foreach($element->querySelectorAll('select[name="theme"] option') as $option) {
		if($option->value === $theme) {
			$option->setAttribute("selected", "selected");
		}
	}
	$scheme = Theme::scheme($request);
	$element->querySelector('select[name="scheme"] option[value="' . $scheme . '"]')->setAttribute("selected", "");
	$tint = Theme::tint($request);
	$tintInput = $element->querySelector('input[name="tint"]');
	$presetTint = Theme::presetTint($theme, $scheme);
	$tintInput->setAttribute("value", $tint ?? $presetTint);
	$tintInput->setAttribute("data-custom", $tint ? "true" : "false");
	$element->querySelector('input[name="tint-preset"]')->setAttribute("value", $presetTint);
	$primary = Theme::primary($request);
	$primaryInput = $element->querySelector('input[name="primary"]');
	$presetPrimary = Theme::presetPrimary($theme, $scheme);
	$primaryInput->setAttribute("value", $primary ?? $presetPrimary);
	$primaryInput->setAttribute("data-custom", $primary ? "true" : "false");
	$element->querySelector('input[name="primary-preset"]')->setAttribute("value", $presetPrimary);
}
