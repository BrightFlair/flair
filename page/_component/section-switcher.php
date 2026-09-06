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
	foreach($element->querySelectorAll(".theme-form option") as $option) {
		if($option->value === Theme::current($request)) {
			$option->setAttribute("selected", "");
		}
	}
}
