<?php
use App\Site\Theme;
use Gt\Dom\Element;
use Gt\Http\ServerRequest;

function go(Element $element, ServerRequest $request):void {
	$theme = Theme::current($request);
	$element->querySelector('option[value="' . $theme . '"]')->setAttribute("selected", "selected");
	$scheme = Theme::scheme($request);
	$element->querySelector('select[name="scheme"] option[value="' . $scheme . '"]')->setAttribute("selected", "");
}
